import { PrismaClient } from '@prisma/client';
import { queryField, nonNull } from 'nexus/dist';

interface Context {
  prisma: PrismaClient;
}

export const countUsers = queryField('countUsers', {
  type: 'Counter',
  args: {
    message: nonNull('String'),
  },
  resolve: async (_root, args, ctx: Context) => {
    const aggr = await ctx.prisma.user.aggregate({ _count: { address: true } });
    const { message } = args;
    return {
      count: aggr._count.address,
      message,
    };
  },
});

export const countUsersPrisma = queryField('countUsersPrisma', {
  type: 'Counter',
  resolve: async (_root, _args, ctx: Context) => ctx.prisma.user.doCount(),
});
