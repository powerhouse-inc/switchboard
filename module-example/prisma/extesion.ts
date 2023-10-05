import { Prisma, PrismaClient } from '@prisma/client';

export const prismaExtension = Prisma.defineExtension((client) => client.$extends({
  name: 'prisma-extension-user-counter',
  model: {
    user: {
      doCount: async () => {
        const aggr = await client.user.aggregate({ _count: { address: true } });
        const message = 'Hello from Prisma';
        return {
          count: aggr._count.address,
          message,
        };
      },
    },
  },
}));

export const extend = (prisma: PrismaClient) => prisma.$extends(prismaExtension);
export type ExtendedPrismaClient = ReturnType<typeof extend>;
