import { PrismaClient } from '@prisma/client';
import * as types from './src/index';

const getUserCrud = (prisma: PrismaClient) => ({
  doCount: async () => {
    const aggr = await prisma.user.aggregate({ _count: { address: true } });
    const message = 'Hello from Prisma';
    return {
      count: aggr._count.address,
      message,
    };
  },
});

export const setup = (prisma: PrismaClient) => {
  const extended = prisma.$extends({
    model: {
      user: getUserCrud(prisma),
    },
  });
  return { types, prisma: extended };
};
