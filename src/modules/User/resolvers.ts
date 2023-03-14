import { queryField, mutationField, nonNull } from 'nexus/dist';
import { UserOperations } from './model';

export const me = queryField('me', {
  type: 'User',
  resolve: (_, __, ctx) => ctx.prisma.user.findUnique({
    where: {
      id: ctx.authVerificationResult.userId,
    },
  }),
});

export const signIn = mutationField('signIn', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user: userNamePass }, ctx) => {
    const operations = new UserOperations(ctx.prisma.user);
    return operations.signIn(userNamePass);
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    const operations = new UserOperations(ctx.prisma.user);
    return operations.signUp(user);
  },
});
