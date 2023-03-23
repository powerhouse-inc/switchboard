import { GraphQLError } from 'graphql';
import type express from 'express';
import pino from 'pino';
import { verify } from 'jsonwebtoken';
import { getChildLogger } from './logger';
import  prisma  from './database';
import { JWT_SECRET } from './env';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger({ msgPrefix: 'APOLLO' }, { module: undefined });

export interface Context {
  request: { req: express.Request };
  prisma: typeof prisma;
  getUserId: () => string;
  apolloLogger: pino.Logger;
}

type CreateContextParams = {
  req: express.Request & { log: pino.Logger };
  res: express.Response;
  connection?: unknown;
};

function getUserId(token?: string): string {
  if (!token) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'NOT_AUTHENTICATED' } });
  }
  const verificationTokenResult = verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new GraphQLError(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication token', { extensions: { code: 'AUTHENTICATION_TOKEN_ERROR' } });
    }
    return decoded;
  }) as unknown as { userId: string };
  return verificationTokenResult.userId;
}

export function createContext(params: CreateContextParams): Context {
  logger.trace('Creating context with params: %o', params);
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return {
    request: params,
    prisma,
    apolloLogger,
    getUserId: () => getUserId(token),
  };
}
