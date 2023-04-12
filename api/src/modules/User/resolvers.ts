import { queryField, mutationField, nonNull } from 'nexus/dist';
import { extendSession } from '../Session';

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

export const signIn = mutationField('signIn', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user: userNamePass }, ctx) => {
    const { id } = await ctx.prisma.user.getUserByUsernamePassword(userNamePass);
    const result = await ctx.prisma.session.createSignInSession(id);
    return {
      ...result,
      session: extendSession(result.session),
    };
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    const { id } = await ctx.prisma.user.createUser(user);
    const result = await ctx.prisma.session.createSignUpSession(id);
    return {
      ...result,
      session: extendSession(result.session),
    };
  },
});
