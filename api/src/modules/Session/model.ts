import type { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import { verifyToken, validateOriginAgainstAllowed, generateTokenAndSession } from './helpers';
import { JWT_EXPIRATION_PERIOD } from '../../env';

export function getSessionCrud(
  prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
) {
  return {

    async createAuthenticationSession(userId: string, allowedOrigins: string = '*') {
      return generateTokenAndSession(
        prisma,
        userId,
        { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign in/Sign up', allowedOrigins },
      );
    },

    async createCustomSession(
      userId: string,
      session: { expiryDurationSeconds?: number | null; name: string, allowedOrigins: string },
      isUserCreated: boolean = false,
    ) {
      return generateTokenAndSession(prisma, userId, session, isUserCreated);
    },

    async listSessions(userId: string) {
      return prisma.session.findMany({
        where: {
          createdBy: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },

    async revoke(sessionId: string, userId: string) {
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
      return prisma.session.update({
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
    },

    async getSessionByToken(
      origin?: string,
      token?: string,
    ) {
      if (!token) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'NOT_AUTHENTICATED' },
        });
      }
      const verificationTokenResult = verifyToken(token);
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
      validateOriginAgainstAllowed(session.allowedOrigins, origin);
      return session;
    },
  };
}
