import { GraphQLError } from 'graphql';
import type express from 'express';
import pino from 'pino';
import { getChildLogger } from './logger';
import prisma, { XPrismaClient } from './database';
import { token as tokenUtils } from './helpers';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger(
  { msgPrefix: 'APOLLO' },
  { module: undefined },
);

export interface Context {
  request: { req: express.Request };
  prisma: typeof prisma;
  getUserId: () => Promise<string>;
  apolloLogger: pino.Logger;
}

type CreateContextParams = {
  req: express.Request & { log: pino.Logger };
  res: express.Response;
  connection?: unknown;
};

async function getUserId(
  xprisma: XPrismaClient,
  token?: string,
): Promise<string> {
  if (!token) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'NOT_AUTHENTICATED' },
    });
  }
  const verificationTokenResult = tokenUtils.verify(token);
  const { sessionId } = verificationTokenResult;
  const session = await xprisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    include: {
      creator: true,
    },
  });
  if (session.revokedAt && session.revokedAt < new Date()) {
    throw new GraphQLError('Session expired', {
      extensions: { code: 'SESSION_EXPIRED' },
    });
  }
  return session.creator.id;
}

export function createContext(params: CreateContextParams): Context {
  logger.trace('Creating context with params: %o', params);
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  return {
    request: params,
    prisma,
    apolloLogger,
    getUserId: async () => getUserId(prisma, token),
  };
}
