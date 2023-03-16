import { PrismaClient } from '@prisma/client';
import logger from './logger';

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
    });
  }
  return prisma;
};
