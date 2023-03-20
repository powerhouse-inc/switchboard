import { ApolloError } from 'apollo-server-core';
import type express from 'express';
import { verify } from 'jsonwebtoken';
import { getPrisma } from './database';
import { JWT_SECRET } from './env';

export const prisma = getPrisma();

export interface Context {
  request: { req: express.Request };
  prisma: typeof prisma;
  getUserId: () => string;
}

type CreateContextParams = {
  req: express.Request;
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
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return {
    request: params,
    prisma,
    getUserId: () => getUserId(token),
  };
}
