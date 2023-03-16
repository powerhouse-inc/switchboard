import { PrismaClient } from '@prisma/client';
import logger from './logger';
import { dbLogLevels } from './env';

let prisma: PrismaClient;

export const getPrisma = () => {
  logger.debug('Getting prisma client');
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
