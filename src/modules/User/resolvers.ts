import { queryField, mutationField, nonNull } from 'nexus/dist';

export const me = queryField('me', {
  type: 'User',
  resolve: async (_, __, ctx) => {
    const user = await ctx.getUser();
    const { id } = user;
    return ctx.prisma.user.findUnique({
      where: {
        id,
      },
    });
  },
});

export const signIn = mutationField('signIn', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user: userNamePass }, ctx) => ctx.prisma.user.signIn(userNamePass),
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => ctx.prisma.user.signUp(user),
});
