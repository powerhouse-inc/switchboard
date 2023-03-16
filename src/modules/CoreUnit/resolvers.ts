import { stringArg, list, queryField } from 'nexus/dist';

export const coreUnits = queryField('coreUnits', {
  type: list('CoreUnit'),
  resolve: async (_parent, _args, ctx) => {
    const response = await ctx.prisma.coreUnit.findMany();
    ctx.request.req.log.info({
      message: 'returning 200 from `coreUnits` resolver',
      response,
    });
    return response;
  },
});

export const coreUnit = queryField('coreUnit', {
  type: 'CoreUnit',
  args: { id: stringArg() },
  resolve: async (_parent, { id }, ctx) => {
    if (!id) {
      ctx.request.req.log.error('coreUnit resolver: id is undefined');
      throw new Error('please provide id');
    }
    const response = await ctx.prisma.coreUnit.findUnique({
      where: {
        id,
      },
    });
    ctx.request.req.log.info({
      message: 'returning 200 from `coreUnit` resolver',
      response,
    });
    return response;
  },
});
