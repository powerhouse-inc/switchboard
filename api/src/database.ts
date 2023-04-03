import { PrismaClient, Prisma, User as PrismaUser } from '@prisma/client';
import { Level as PinoLevel } from 'pino';
import { getChildLogger } from './logger';
import { GraphQLError } from 'graphql';
import { compare, hash } from 'bcrypt';
import { AUTH_SIGNUP_ENABLED, JWT_EXPIRATION_PERIOD } from './env';
import ms from 'ms';
import {token as tokenUtils} from './helpers/'

const dbLogger = getChildLogger({ msgPrefix: 'DATABASE' });

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging#log-to-stdout
const LOGGING_EVENTS: { level: Prisma.LogLevel; emit: 'event' }[] = [
  {
    emit: 'event',
    level: 'query',
  },
  {
    emit: 'event',
    level: 'error',
  },
  {
    emit: 'event',
    level: 'info',
  },
  {
    emit: 'event',
    level: 'warn',
  },
];

const PRISMA_TO_PINO_LOG_LEVEL: Record<Prisma.LogLevel, PinoLevel> = {
  query: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

function getSessionCrud(prisma: PrismaClient) {
  return {
    listSessions: async (userId: string) => prisma.session.findMany({
      where: {
        createdBy: userId,
      },
    }),
    revoke: async (sessionId: string, userId: string) => {
      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });
      if (!session) {
        throw new GraphQLError('Session not found', { extensions: { code: 'SESSION_NOT_FOUND' } });
      }
      if (session.revokedAt !== null) {
        throw new GraphQLError('Session already revoked', { extensions: { code: 'SESSION_ALREADY_REVOKED' } });
      }
      try {
        return await prisma.session.update({
          where: {
            createdBy_id: {
              id: sessionId,
              createdBy: userId,
            },
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (e) {
        throw new GraphQLError('Failed to revoke session', { extensions: { code: 'REVOKE_SESSION_FAILED' } });
      }
    },
    createSignInSession: async (userId: string) => generateTokenAndSession(
      prisma,
      userId,
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign in' },
    ),
    createSignUpSession: async (userId: string) => generateTokenAndSession(
      prisma,
      userId,
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign up' },
    ),
    createCustomSession: async (
      userId: string,
      session: { expiryDurationSeconds?: number | null; name: string },
      isUserCreated: boolean = false,
    ) => generateTokenAndSession(prisma, userId, session, isUserCreated),
    async getSessionByToken(
      token?: string,
    ) {
      if (!token) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'NOT_AUTHENTICATED' },
        });
      }
      const verificationTokenResult = tokenUtils.verify(token);
      const { sessionId } = verificationTokenResult;
      const session = await prisma.session.findUniqueOrThrow({
        where: {
          id: sessionId,
        },
        include: {
          creator: true,
        },
      });
      if (session.revokedAt) {
        throw new GraphQLError('Session expired', {
          extensions: { code: 'SESSION_EXPIRED' },
        });
      }
      return session;
    },
  };
}

function getUserCrud(prisma: PrismaClient) {
  return {
    getUserByUsernamePassword: async (userNamePass: { username: string; password: string }) => {
      const { username, password } = userNamePass;
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'USER_NOT_FOUND' } });
      }
      const passwordValid = await compare(password, user.password);
      if (!passwordValid) {
        throw new GraphQLError('Invalid password', { extensions: { code: 'INVALID_PASSWORD' } });
      }
      return user;
    },
    createUser: async (user: { username: string; password: string }) => {
      if (!AUTH_SIGNUP_ENABLED) {
        throw new Error('Sign up is disabled');
      }
      const { username, password } = user;
      const hashedPassword = await hash(password, 10);
      let createdUser: PrismaUser;
      try {
        createdUser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });
      } catch (e: any) {
        if ('code' in e && e.code === 'P2002') {
          throw new GraphQLError('Username already taken', { extensions: { code: 'USERNAME_TAKEN' } });
        }
        /* istanbul ignore next @preserve */
        throw e;
      }
      return createdUser;
    },
  };
}

// get base prisma client
const prismaBase = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./db.sqlite',
    },
  },
  log: LOGGING_EVENTS,
});

// attach event listeners to log events via Pino
LOGGING_EVENTS.forEach((event) => {
  prismaBase.$on(event.level, (e) => {
    dbLogger[PRISMA_TO_PINO_LOG_LEVEL[event.level]](e, `Prisma ${event.level}`);
  });
});

// extend the client with user CRUD
const prisma = prismaBase.$extends({
  model: {
    user: {
      ...getUserCrud(prismaBase),
    },
    session: {
      ...getSessionCrud(prismaBase),
    },
  },
});

export default prisma;
