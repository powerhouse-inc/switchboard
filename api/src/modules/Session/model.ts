import type { PrismaClient, Prisma } from '@prisma/client';
import { inputObjectType, objectType } from 'nexus/dist';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import { token as tokenUtils } from '../../helpers';
import { JWT_EXPIRATION_PERIOD } from '../../env';
import { SiweMessage } from 'siwe';

export const Session = objectType({
  name: 'Session',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.date('createdAt');
    t.nonNull.string('createdBy');
    t.date('referenceExpiryDate');
    t.nonNull.string('referenceTokenId');
    t.nonNull.boolean('isUserCreated');
    t.string('name');
    t.date('revokedAt');
  },
});

export const SessionCreate = inputObjectType({
  name: 'SessionCreate',
  definition(t) {
    t.int('expiryDurationSeconds');
    t.nonNull.string('name');
  },
});

export const SessionCreateOutput = objectType({
  name: 'SessionCreateOutput',
  definition(t) {
    t.nonNull.field('session', { type: 'Session' });
    t.nonNull.string('token');
  },
});

async function newSession(
  prisma: PrismaClient,
  session: Prisma.SessionCreateInput,
) {
  return prisma.session.create({
    data: session,
  });
}

const generateTokenAndSession = async (
  prisma: PrismaClient,
  userId: string,
  session: { expiryDurationSeconds?: number | null; name: string, id: string },
  isUserCreated: boolean = false,
) => {
  const createdToken = tokenUtils.generate(session.id, session.expiryDurationSeconds);
  const expiryDate = tokenUtils.getExpiryDateFromToken(createdToken);
  const formattedToken = tokenUtils.format(createdToken);
  const createData = {
    name: session.name,
    referenceExpiryDate: expiryDate,
    id: session.id,
    referenceTokenId: formattedToken,
    isUserCreated,
    creator: {
      connect: {
        id: userId,
      },
    },
  };
  const createdSession = await newSession(prisma, createData);
  return {
    token: createdToken,
    session: createdSession,
  };
};

async function createPendingSession(prisma: PrismaClient): Promise<string> {
  const id = randomUUID();
  await prisma.pendingAuth.create({
    data: {
      id,
    },
  });
  return id
}

async function verifyMessageAndCreateSession(
  prisma: PrismaClient,
  message: string,
  signature: string,
  userId: string,
  session: { expiryDurationSeconds?: number | null; name: string },
  isUserCreated: boolean = false
) {
  const siweMessage = new SiweMessage(message);
  const sessionId = siweMessage.nonce;
  try {
    await siweMessage.validate(signature);
  } catch (e) {
    throw new GraphQLError('Invalid signature');
  }
  return generateTokenAndSession(prisma, userId, {...session, id: sessionId}, isUserCreated);
}

export function getSessionCrud(prisma: PrismaClient) {
  return {
    listSessions: async (userId: string) => prisma.session.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
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
