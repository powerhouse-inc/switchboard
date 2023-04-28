import { queryField, mutationField, nonNull } from 'nexus/dist';

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

export const getChallenge = mutationField('getChallenge', {
  type: 'Challenge',
  resolve: async (_, __, ctx) => {
    return ctx.prisma.session.getChallenge();
  }
});

export const solveChallenge = mutationField('solveChallenge', {
  type: 'SessionCreateOutput',
  args: {
    message: nonNull('String'),
    signature: nonNull('String'),
  },
  resolve: async (_, { message, signature }, ctx) => {
    return ctx.prisma.session.solveChallenge(message, signature);
  }
});

