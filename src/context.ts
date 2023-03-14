import { PrismaClient } from '@prisma/client';
import type express from 'express';
import { verify } from 'jsonwebtoken';
import { getPrisma } from './database';
import { JWT_SECRET } from './env';
import { JwtVerificationResult } from './types';

const prisma = getPrisma();

export interface Context {
  request: { req: express.Request };
  prisma: PrismaClient;
  authVerificationResult: JwtVerificationResult;
}

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

function getUserId(authorization: string): JwtVerificationResult {
  if (!authorization) {
    return { userId: null, error: 'Unhandled' };
  }
  const token = authorization.replace('Bearer ', '');
  const verificationTokenResult = verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return { userId: null, error: err.name === 'TokenExpiredError' ? 'JwtExpired' : 'Unhandled' };
    }
    return decoded;
  }) as unknown as JwtVerificationResult;
  return verificationTokenResult;
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
    authVerificationResult: authorization ? getUserId(authorization) : { userId: null },
  };
}
