import { queryField, mutationField, nonNull } from 'nexus/dist';
import { UserInterface } from './model';

export const me = queryField('me', {
  type: 'User',
  resolve: (_, __, ctx) => {
    if (!ctx.authVerificationResult.userId) {
      throw new Error('Unexpected middleware behaviour.');
    }
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.authVerificationResult.userId,
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
    const userInterface = new UserInterface(ctx.prisma.user);
    return userInterface.signIn(userNamePass);
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    const userInterface = new UserInterface(ctx.prisma.user);
    return userInterface.signUp(user);
  },
});
