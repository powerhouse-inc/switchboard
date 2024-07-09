import type express from 'express';
import pino from 'pino';
import { Session } from '@prisma/client';
import { getChildLogger } from '../../../logger';
import { getExtendedPrisma } from '../../../importedModules';
import NotFoundError from '../../../errors/NotFoundError';
import { DocumentDriveState } from 'document-model-libs/document-drive';

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

export async function createContext(params: CreateContextParams): Promise<Context> {
  logger.trace('Creating context with params: %o', params);
  const { req } = params;
  const authorizationHeader = req.get('Authorization');
  const cookieAuthHeader = req.cookies['gql:default'];
  const token = authorizationHeader?.replace('Bearer ', '');
  const origin = req.get('Origin');
  const prisma = getExtendedPrisma();

  const { driveIdOrSlug } = req.params;
  if (!driveIdOrSlug) {
    throw new NotFoundError({ message: "Drive Id or Slug required" })
  }
  let drive: DocumentDriveState
  const drives = await prisma.document.getDrives();

  if (drives.find(d => d === driveIdOrSlug)) {
    drive = await prisma.document.getDrive(driveIdOrSlug);
  } else {
    drive = await prisma.document.getDriveBySlug(driveIdOrSlug);
  }

  return {
    request: params,
    prisma,
    apolloLogger,
    getSession: async () => prisma.session.getSessionByToken(origin, token || cookieAuthHeader),
    origin,
    driveId: drive.id,
  };
}
