import { PrismaClient } from '@prisma/client';
import type express from 'express';
import pino from 'pino';
import { getChildLogger } from './logger';
import { verify } from 'jsonwebtoken';
import { getPrisma } from './database';
import { JWT_SECRET } from './env';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger({ msgPrefix: 'APOLLO' }, { module: undefined });

export const prisma = getPrisma();

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
    throw new ApolloError('Not authenticated');
  }
  const verificationTokenResult = verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new ApolloError(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication token');
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
