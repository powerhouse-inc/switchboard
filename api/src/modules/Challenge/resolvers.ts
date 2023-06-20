import { mutationField, nonNull } from 'nexus/dist';

export const createChallenge = mutationField('createChallenge', {
  type: 'Challenge',
  args: {
    address: nonNull('String'),
  },
  resolve: async (_root, args, ctx) => ctx.prisma.challenge.createChallenge(ctx.origin, args.address),
});

export const solveChallenge = mutationField('solveChallenge', {
  type: 'SessionCreateOutput',
  args: {
    nonce: nonNull('String'),
    signature: nonNull('String'),
  },
  resolve: async (_root, args, ctx) => ctx.prisma.challenge.solveChallenge(ctx.origin, args.nonce, args.signature),
});
