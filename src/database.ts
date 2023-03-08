import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export const getPrisma = () => {
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
