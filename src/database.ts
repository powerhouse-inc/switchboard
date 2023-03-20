import { PrismaClient } from '@prisma/client';
import { getUserCrud } from './modules';

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
  const xprisma = prisma.$extends({
    model: {
      user: {
        ...getUserCrud(prisma),
      },
    },
  });
  return xprisma;
};
