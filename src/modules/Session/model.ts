import { inputObjectType, objectType } from 'nexus/dist';
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { token } from '../../helpers';
import { ApolloError } from 'apollo-server-core';

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
    t.date('referenceExpiryDate');
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

async function listSessions(prisma: PrismaClient, userId: string) {
  return prisma.session.findMany({
    where: {
      createdBy: userId,
    },
  });
}

async function revoke(prisma: PrismaClient, sessionId: string) {
  try {
    return await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch (e) {
    console.error(e);
    throw new ApolloError("Failed to update session", 'SESSION_UPDATE_FAILED');
  }
}

export async function generateTokenAndSession(
  prisma: PrismaClient,
  userId: string,
  session: { referenceExpiryDate?: Date; name?: string },
  isUserCreated: boolean = false,
) {
  const createId = randomUUID();
  const createdToken = token.generate(createId, session.referenceExpiryDate);
  const formattedToken = token.format(createdToken);
  const createData = {
    ...session,
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
}

export function getSessionCrud(prisma: PrismaClient) {
  return {
    listSessions: async (userId: string) => listSessions(prisma, userId),
    revoke: async (sessionId: string) => revoke(prisma, sessionId),
    generateTokenAndSession: async (
      userId: string,
      session: { referenceExpiryDate?: Date; name: string },
    ) => generateTokenAndSession(prisma, userId, session, true),
  };
}
