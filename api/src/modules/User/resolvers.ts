import { queryField } from 'nexus/dist';

export const me = queryField('me', {
  type: 'User',
  resolve: async (_, __, ctx) => {
    const { createdBy } = await ctx.getSession();
    return ctx.prisma.user.findUnique({
      where: {
        id: createdBy,
      },
    });
  },
});
