import { PrismaClient } from '@prisma/client';
import { getChildLogger } from './logger';
import { loggerConfig } from '../logger.config';

const { dbLogLevel } = loggerConfig;

const dbLogger = getChildLogger({ msgPrefix: 'DATABASE' });
let prisma: PrismaClient;

export const getPrisma = () => {
  dbLogger.debug('Getting prisma client');
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./db.sqlite',
        },
      },
      log: dbLogLevel,
    });
  }
  return prisma;
};
