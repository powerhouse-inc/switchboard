import type express from 'express';
import pino from 'pino';
import { Session } from '@prisma/client';
import { getChildLogger } from '../../../logger';
import { getExtendedPrisma } from '../../../importedModules';
import type { Extra } from "graphql-ws/lib/use/ws";

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

export function createContextWebsocket(request: Extra["request"]): Context {
  const authorizationHeader = request.headers.authorization;
  // const cookies = cookieParser(request.headers?.cookie);
  // const cookieAuthHeader = request.coo.cookies['gql:default'];
  const token = authorizationHeader?.replace('Bearer ', '');

  const url = request.url ?? "";
  const match = url.match(/(?<=\/d\/)([^\/]*)/);
  const driveId = match?.[0];
  if (!driveId) {
    throw Error("No drive id found in url");
  }
  const origin = request.headers.host ?? "";
  const prisma = getExtendedPrisma();

  return {
    // request: params,
    prisma,
    apolloLogger,
    getSession: async () => prisma.session.getSessionByToken(origin, token || cookieAuthHeader),
    origin,
    driveId,
  };
}
