import { stringArg, list, queryField } from 'nexus/dist';

export const coreUnits = queryField('coreUnits', {
  type: list('CoreUnit'),
  resolve: (parent, args, ctx) => ctx.prisma.coreUnit.findMany(),
});

export const coreUnit = queryField('coreUnit', {
  type: 'CoreUnit',
  args: { id: stringArg() },
  resolve: (parent, { id }, ctx) => {
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
