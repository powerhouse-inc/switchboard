import { GraphQLError } from 'graphql';
import type express from 'express';
import pino from 'pino';
import { getChildLogger } from './logger';
import prisma from './database';
import {User} from '@prisma/client'
import { token as tokenUtils } from './helpers';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger(
  { msgPrefix: 'APOLLO' },
  { module: undefined },
);

export interface Context {
  request: { req: express.Request };
  prisma: typeof prisma;
  getUser: () => Promise<User>;
  apolloLogger: pino.Logger;
}

type CreateContextParams = {
  req: express.Request & { log: pino.Logger };
  res: express.Response;
  connection?: unknown;
};

async function getUser(
  token?: string,
): Promise<User> {
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

export function createContext(params: CreateContextParams): Context {
  logger.trace('Creating context with params: %o', params);
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  return {
    request: params,
    prisma,
    apolloLogger,
    getUser: async () => getUser(token),
  };
}
