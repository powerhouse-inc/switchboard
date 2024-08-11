import type express from 'express';
import pino from 'pino';
import { Session } from '@prisma/client';
import { getChildLogger } from '../../../logger';
import { getExtendedPrisma } from '../../../importedModules';

const logger = getChildLogger({ msgPrefix: 'CONTEXT' });
const apolloLogger = getChildLogger(
  { msgPrefix: 'APOLLO' },
  { module: undefined },
);

export interface Context {
  request: { req: express.Request };
  prisma: ReturnType<typeof getExtendedPrisma>;
  getSession: () => Promise<Session>;
  apolloLogger: pino.Logger;
  origin: string | undefined;
  driveId?: string;
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
  const cookieAuthHeader = req.cookies['gql:default'];
  const token = authorizationHeader?.replace('Bearer ', '');
  const origin = req.get('Origin');
  const prisma = getExtendedPrisma();

  const { driveId } = req.params;

  return {
    request: params,
    prisma,
    apolloLogger,
    getSession: async () => prisma.session.getSessionByToken(origin, token || cookieAuthHeader),
    origin,
    driveId,
  };
}
