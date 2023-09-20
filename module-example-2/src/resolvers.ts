import { stringArg, list, queryField } from 'nexus/dist';

export const coreUnits = queryField('coreUnits', {
  type: list('CoreUnit'),
  resolve: async (_parent, _args, ctx) => {
    const response = await ctx.prisma.coreUnit.findMany();
    return response;
  },
});

export const coreUnit = queryField('coreUnit', {
  type: 'CoreUnit',
  args: { id: stringArg() },
  resolve: async (_parent, { id }, ctx) => {
    if (!id) {
      throw new Error('please provide id');
    }
    return ctx.prisma.coreUnit.findUnique({
      where: {
        id,
      },
    });
  },
});

