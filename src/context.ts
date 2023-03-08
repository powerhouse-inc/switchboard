import { PrismaClient } from '@prisma/client';
import type express from 'express';
import { getPrisma } from './database';

export interface Context {
  request: { req: express.Request };
  prisma: PrismaClient;
}

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  return {
    request: params,
    prisma: getPrisma(),
  };
}
