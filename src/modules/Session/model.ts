import { inputObjectType, objectType } from 'nexus/dist';
import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { token } from '../../helpers';

export const Session = objectType({
  name: 'Session',
  definition(t) {
    t.string('id');
    t.date('createdAt');
    t.string('createdBy');
    t.date('referenceExpiryDate');
    t.string('referenceTokenId');
    t.string('name');
    t.date('revokedAt');
  },
});

export const SessionCreate = inputObjectType({
  name: 'SessionCreate',
  definition(t) {
    t.nonNull.date('referenceExpiryDate');
    t.nonNull.string('name');
  },
});

export const SessionCreateOutput = objectType({
  name: 'SessionCreateOutput',
  definition(t) {
    t.nonNull.field('createdSession', { type: 'Session' });
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
  return prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function generateTokenAndSession(
  prisma: PrismaClient,
  userId: string,
  session: { referenceExpiryDate: Date; name?: string },
) {
  const createId = randomUUID();
  const createdToken = token.generate(userId, createId);
  const formattedToken = token.format(createdToken);
  const createData = {
    ...session,
    id: createId,
    referenceTokenId: formattedToken,
    creator: {
      connect: {
        id: userId,
      },
    },
  };
  const createdSession = await newSession(prisma, createData);
  return {
    createdToken,
    createdSession,
  };
}

export function getSessionCrud(prisma: PrismaClient) {
  return {
    all: async (userId: string) => listSessions(prisma, userId),
    revoke: async (sessionId: string) => revoke(prisma, sessionId),
    generateTokenAndSession: async (
      userId: string,
      session: { referenceExpiryDate: Date; name?: string },
    ) => generateTokenAndSession(prisma, userId, session),
  };
}
