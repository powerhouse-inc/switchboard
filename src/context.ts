import { PrismaClient } from '@prisma/client';
import type express from 'express';
import pino from 'pino';
import { getPrisma } from './database';
import { getChildLogger } from './logger';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger({ msgPrefix: 'APOLLO' }, { module: undefined });

export interface Context {
  request: { req: express.Request & { log: pino.Logger } };
  prisma: PrismaClient;
  apolloLogger: pino.Logger;
}

type CreateContextParams = {
  req: express.Request & { log: pino.Logger };
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  logger.trace('Creating context with params: %o', params);
  return {
    request: params,
    prisma: getPrisma(),
    apolloLogger,
  };
}
