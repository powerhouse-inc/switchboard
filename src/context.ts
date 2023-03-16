import { PrismaClient } from '@prisma/client';
import type express from 'express';
import pino from 'pino';
import { getPrisma } from './database';
import logger from './logger';

export interface Context {
  request: { req: express.Request & { log: pino.Logger } };
  prisma: PrismaClient;
}

type CreateContextParams = {
  req: express.Request & { log: pino.Logger };
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  logger.debug('creating context with params: %o', params);
  return {
    request: params,
    prisma: getPrisma(),
  };
}
