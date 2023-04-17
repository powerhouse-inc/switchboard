import type { PrismaClient, Prisma } from '@prisma/client';
import { inputObjectType, objectType } from 'nexus/dist';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import wildcard from 'wildcard-match';
import { token as tokenUtils } from '../../helpers';
import { JWT_EXPIRATION_PERIOD } from '../../env';

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
    t.string('originRestriction');
  },
});

export const SessionCreate = inputObjectType({
  name: 'SessionCreate',
  definition(t) {
    t.int('expiryDurationSeconds');
    t.nonNull.string('name');
    t.nonNull.string('originRestriction');
  },
});

export const SessionCreateOutput = objectType({
  name: 'SessionCreateOutput',
  definition(t) {
    t.nonNull.field('session', { type: 'Session' });
    t.nonNull.string('token');
  },
});

function validateOrigin(originParam: string): void {
  if (originParam === '*') {
    return;
  }
  const trimmedOriginParam = originParam.trim();
  const origins = trimmedOriginParam.split(',');
  origins.forEach((origin) => {
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      throw new Error("Origin must start with 'http://' or 'https://'");
    }
  });
}

function throwGQLErrorIfOriginDisallowed(
  originRestriction: string,
  originReceived?: string,
) {
  if (originRestriction !== '*') {
    if (!originReceived) {
      throw new GraphQLError('Origin not provided', {
        extensions: { code: 'ORIGIN_HEADER_MISSING' },
      });
    }
    const allowedOrigins = originRestriction.split(',');
    if (!wildcard(allowedOrigins)(originReceived)) {
      throw new GraphQLError('Access denied due to origin restriction', {
        extensions: { code: 'ORIGIN_FORBIDDEN' },
      });
    }
  }
}
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
  session: { expiryDurationSeconds?: number | null; name: string; originRestriction: string },
  isUserCreated: boolean = false,
) => {
  const createId = randomUUID();
  const createdToken = tokenUtils.generate(createId, session.expiryDurationSeconds);
  const expiryDate = tokenUtils.getExpiryDateFromToken(createdToken);
  const formattedToken = tokenUtils.format(createdToken);

  try { validateOrigin(session.originRestriction); } catch (e: any) {
    throw new GraphQLError(e.message, { extensions: { code: 'INVALID_ORIGIN_FORMAT' } });
  }

  const createData = {
    originRestriction: session.originRestriction,
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
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign in', originRestriction: '*' },
    ),
    createSignUpSession: async (userId: string) => generateTokenAndSession(
      prisma,
      userId,
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign up', originRestriction: '*' },
    ),
    createCustomSession: async (
      userId: string,
      session: { expiryDurationSeconds?: number | null; name: string, originRestriction: string },
      isUserCreated: boolean = false,
    ) => generateTokenAndSession(prisma, userId, session, isUserCreated),
    async getSessionByToken(
      origin?: string,
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
      throwGQLErrorIfOriginDisallowed(session.originRestriction, origin);
      return session;
    },

  };
}
