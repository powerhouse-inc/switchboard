import { queryField, mutationField, nonNull } from 'nexus/dist';
import ms from 'ms';
import { JWT_EXPIRATION_PERIOD } from '../../env';

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
    const user = await ctx.prisma.user.validatePassword(userNamePass);
    return ctx.prisma.session.generateTokenAndSession(
      user.id,
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign in' },
    );
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    const createdUser = await ctx.prisma.user.createUser(user);
    return ctx.prisma.session.generateTokenAndSession(
      createdUser.id,
      { expiryDurationSeconds: ms(JWT_EXPIRATION_PERIOD) / 1000, name: 'Sign up' },
    );
  },
});
