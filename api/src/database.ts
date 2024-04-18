import { PrismaClient, Prisma } from '@prisma/client';
import { Level as PinoLevel } from 'pino';
import { getChildLogger } from './logger';
import { getUserCrud, getSessionCrud, getChallengeCrud, getRWACRUD } from './modules';
import { getDocumentDriveCRUD } from './modules/document';
import { createClient } from 'redis';
const dbLogger = getChildLogger({ msgPrefix: 'DATABASE' });

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging#log-to-stdout
const LOGGING_EVENTS: { level: Prisma.LogLevel; emit: 'event' }[] = [
  {
    emit: 'event',
    level: 'query',
  },
  {
    emit: 'event',
    level: 'error',
  },
  {
    emit: 'event',
    level: 'info',
  },
  {
    emit: 'event',
    level: 'warn',
  },
];

const PRISMA_TO_PINO_LOG_LEVEL: Record<Prisma.LogLevel, PinoLevel> = {
  query: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

// get base prisma client
const prismaBase = new PrismaClient({
  log: LOGGING_EVENTS,
});

// attach event listeners to log events via Pino
LOGGING_EVENTS.forEach((event) => {
  prismaBase.$on(event.level, (e) => {
    dbLogger[PRISMA_TO_PINO_LOG_LEVEL[event.level]](e, `Prisma ${event.level}`);
  });
});

// extend the client with user CRUD
const prisma = prismaBase.$extends({
  model: {
    user: getUserCrud(prismaBase),
    session: getSessionCrud(prismaBase),
    challenge: getChallengeCrud(prismaBase),
    document: getDocumentDriveCRUD(prismaBase),
    rWAPortfolio: getRWACRUD(prismaBase),
  },
});

export default prisma;
