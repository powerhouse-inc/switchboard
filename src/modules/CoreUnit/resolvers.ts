import { stringArg, list, queryField } from 'nexus/dist';

export const coreUnits = queryField('coreUnits', {
  type: list('CoreUnit'),
  resolve: (_parent, _args, ctx) => ctx.prisma.coreUnit.findMany(),
});

export const coreUnit = queryField('coreUnit', {
  type: 'CoreUnit',
  args: { id: stringArg() },
  resolve: (_parent, { id }, ctx) => {
    if (!id) {
      ctx.request.req.log.error('coreUnit resolver: id is undefined');
      throw new Error('please provide id');
    }
    return ctx.prisma.coreUnit.findUnique({
      where: {
        id,
      },
    });
  },
});
