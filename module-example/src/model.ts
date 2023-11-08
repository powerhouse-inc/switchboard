import { Prisma } from '@prisma/client';

// the model can define functions that would also be awailable in the core
// and in the modules that are setup after this one
export const prismaExtension = Prisma.defineExtension((client: any) => client.$extends({
  name: 'prisma-extension-user-counter',
  model: {
    user: {
      getCount: async () => {
        const aggr = await client.user.aggregate({ _count: { address: true } });
        return aggr._count.address
      },
    },
  },
}));
