import { queryField, objectType } from 'nexus/dist';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('address');
  },
});

export const me = queryField('me', {
  type: 'User',
  resolve: async (_, __, ctx) => {
    const { createdBy } = await ctx.getSession();
    return ctx.prisma.user.findUnique({
      where: {
        address: createdBy,
      },
    });
  },
});
