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
  resolve: async (_parent, { user: userNamePass }, ctx) => {
    const { id } = await ctx.prisma.user.validatePassword(userNamePass);
    return ctx.prisma.session.createSignInSession(id);
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    const { id } = await ctx.prisma.user.createUser(user);
    return ctx.prisma.session.createSignUpSession(id);
  },
});
