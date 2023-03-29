import { inputObjectType, objectType } from 'nexus/dist';
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import { token } from '../../helpers';
import { token as tokenUtils } from '../../helpers';

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

export function getSessionCrud(prisma: PrismaClient) {
  return {
    listSessions: async (userId: string) => prisma.session.findMany({
      where: {
        createdBy: userId,
      },
    }),
    revoke: async (sessionId: string, userId: string) => {
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
        throw new GraphQLError('Failed to update session', { extensions: { code: 'SESSION_UPDATE_FAILED' } });
      }
    },
    generateTokenAndSession: async (
      userId: string,
      session: { expiryDurationSeconds?: number; name: string },
      isUserCreated: boolean = false,
    ) => {
      const createId = randomUUID();
      const createdToken = token.generate(createId, session.expiryDurationSeconds);
      const formattedToken = token.format(createdToken);
      const createData = {
        name: session.name,
        referenceExpiryDate: token.getExpiryDate(session.expiryDurationSeconds),
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
    },
    getUser: async function (
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
      return session.creator;
    }

  };
}
