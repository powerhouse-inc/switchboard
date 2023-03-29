import type express from 'express';
import pino from 'pino';
import { User } from '@prisma/client';
import { getChildLogger } from './logger';
import prisma from './database';

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

export function createContext(params: CreateContextParams): Context {
  logger.trace('Creating context with params: %o', params);
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  return {
    request: params,
    prisma,
    apolloLogger,
    getUser: async () => prisma.session.getUser(token),
  };
}
