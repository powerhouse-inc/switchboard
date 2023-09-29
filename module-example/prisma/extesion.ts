import { Prisma } from '@prisma/client';

export const prismaExtension = Prisma.defineExtension((client: any) => client.$extends({
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
