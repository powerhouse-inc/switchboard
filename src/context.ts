import { PrismaClient } from '@prisma/client';
import type express from 'express';
import { getPrisma } from './database';
import { getUserId } from './utils/auth';
import { JWT_SECRET } from './env';

const prisma = getPrisma();

export interface Context {
  request: { req: express.Request };
  prisma: PrismaClient;
  userId: string | null;
}

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  const { req, connection } = params;
  const authorization = !req || !req.headers
    ? (connection as any)?.context?.connectionParams?.Authorization // for subscriptions.
    : req.get('Authorization'); // for queries & mutations.

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return {
    request: params,
    prisma,
    userId: getUserId(authorization),
  };
}
