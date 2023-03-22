import { PrismaClient } from '@prisma/client';
import { getChildLogger } from './logger';
import { loggerConfig } from '../logger.config';
import { getUserCrud } from './modules';

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
  const xprisma = prisma.$extends({
    model: {
      user: {
        ...getUserCrud(prisma),
      },
    },
  });
  return xprisma;
};
