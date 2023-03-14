import { queryField, mutationField, nonNull } from 'nexus/dist';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { AUTH_SIGNUP_ENABLED, JWT_EXPIRATION_PERIOD, JWT_SECRET } from '../../env';

export const me = queryField('me', {
  type: 'User',
  resolve: (_, __, ctx) => {
    if (!ctx.authVerificationResult || !('userId' in ctx.authVerificationResult)) {
      throw new Error('Not authorized');
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
    const { username, password } = userNamePass;
    const user = await ctx.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new Error('user not found');
    }
    const passwordValid = (await compare(password, user.password || '')) || false;
    if (!passwordValid) {
      throw new Error('invalid password');
    }
    return {
      token: sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION_PERIOD }),
      user,
    };
  },
});

export const signUp = mutationField('signUp', {
  type: 'AuthPayload',
  args: {
    user: nonNull('UserNamePass'),
  },
  resolve: async (_parent, { user }, ctx) => {
    if (!AUTH_SIGNUP_ENABLED) {
      throw new Error('Sign up is disabled');
    }
    const { username, password } = user;
    const hashedPassword = await hash(password, 10);

    const created = await ctx.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return {
      token: sign({ userId: created.id }, JWT_SECRET),
      user: created,
    };
  },
});
