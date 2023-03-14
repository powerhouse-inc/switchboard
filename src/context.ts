import { PrismaClient } from '@prisma/client';
import type express from 'express';
import { verify } from 'jsonwebtoken';
import { getPrisma } from './database';
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

function getUserId(authorization: string): string | null {
  if (!authorization) {
    return null;
  }
  const token = authorization.replace('Bearer ', '');
  let verifiedToken: { userId: string } | null = null;
  try {
    verifiedToken = verify(token, JWT_SECRET) as { userId: string };
  } catch (err) {
    return null;
  }
  return verifiedToken.userId;
}

export function createContext(params: CreateContextParams): Context {
  const { req } = params;
  const authorization = req.get('Authorization'); // for queries & mutations.

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return {
    request: params,
    prisma,
    userId: authorization ? getUserId(authorization) : null,
  };
}
