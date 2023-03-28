import { ApolloError } from 'apollo-server-core';
import type express from 'express';
import { verify } from 'jsonwebtoken';
import { getPrisma } from './database';
import { JWT_SECRET } from './env';

export const prisma = getPrisma();
// TODO: after merge of logging PR, move the type def to the db module
// Have to derive type since feature is in preview state(https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions#extensions-prerequisites) and typing seems off a bit.
type XPrismaClient = typeof prisma;

export interface Context {
  request: { req: express.Request };
  prisma: typeof prisma;
  getUserId: () => Promise<string>;
}

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

async function getUserId(xprisma: XPrismaClient, token?: string): Promise<string> {
  if (!token) {
    throw new ApolloError('Not authenticated');
  }
  const verificationTokenResult = verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new ApolloError(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication token');
    }
    return decoded;
  }) as unknown as { sessionId: string };
  const { sessionId } = verificationTokenResult;
  const session = await xprisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    include: {
      creator: true,
    },
  });
  if (session.revokedAt && session.revokedAt < new Date()) {
    throw new ApolloError('Session expired');
  }
  return session.creator.id;
}

export function createContext(params: CreateContextParams): Context {
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '');

  return {
    request: params,
    prisma,
    getUserId: async () => getUserId(prisma, token),
  };
}
