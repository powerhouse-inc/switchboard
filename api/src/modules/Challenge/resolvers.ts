import { mutationField, nonNull, objectType } from 'nexus/dist';

export const Challenge = objectType({
  name: 'Challenge',
  definition(t) {
    t.nonNull.string('nonce');
    t.nonNull.string('message');
  },
});

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
