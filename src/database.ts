import { PrismaClient } from '@prisma/client';
import { getModuleBinding, getChildLogger } from './logger';
import { dbLogLevels } from './env';

const dbLogger = getChildLogger({ msgPrefix: 'DATABASE' }, { module: getModuleBinding(__filename) });
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
      log: dbLogLevels,
    });
  }
  return prisma;
};
