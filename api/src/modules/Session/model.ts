import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import { token as tokenUtils } from '../../helpers';
import { JWT_EXPIRATION_PERIOD } from '../../env';
import builder from '../builder'

export const Session = builder.prismaObject('Session', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    createdBy: t.exposeString('createdBy'),
    referenceExpiryDate: t.expose('referenceExpiryDate', { type: 'DateTime', nullable: true }),
    referenceTokenId: t.exposeString('referenceTokenId'),
    isUserCreated: t.exposeBoolean('isUserCreated'),
    name: t.exposeString('name', { nullable: true }),
    revokedAt: t.expose('revokedAt', { type: 'DateTime', nullable: true }),
  }),
});

export const SessionCreate = builder.inputType('SessionCreateInput', {
  fields: (t) => ({
    expiryDurationSeconds: t.int({ required: false }),
    name: t.string({ required: true }),
  }),
});

export const SessionCreateOutput = builder.simpleObject('SessionCreateOutput', {
  fields: (t) => ({
    token: t.string({ nullable: false }),
    session: t.field({ type: Session, nullable: false }),
  }),
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
  session: { expiryDurationSeconds?: number | null; name: string },
  isUserCreated: boolean = false,
) => {
  const createId = randomUUID();
  const createdToken = tokenUtils.generate(createId, session.expiryDurationSeconds);
  const expiryDate = tokenUtils.getExpiryDateFromToken(createdToken);
  const formattedToken = tokenUtils.format(createdToken);
  const createData = {
    name: session.name,
    referenceExpiryDate: expiryDate,
    id: createId,
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

export function getSessionCrud(prisma: PrismaClient) {
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
