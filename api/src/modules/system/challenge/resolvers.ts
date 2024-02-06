import { mutationField, nonNull, objectType } from 'nexus';

export const Challenge = objectType({
  name: 'Challenge',
  definition(t) {
    t.nonNull.string('nonce');
    t.nonNull.string('message');
    t.nonNull.string('hex');
  },
});

export const createChallenge = mutationField('createChallenge', {
  type: 'Challenge',
  args: {
    address: nonNull('String'),
  },
  resolve: async (_root, args, ctx) => ctx.prisma.challenge.createChallenge(args.address),
});

export const solveChallenge = mutationField('solveChallenge', {
  type: 'SessionOutput',
  args: {
    nonce: nonNull('String'),
    signature: nonNull('String'),
  },
  resolve: async (_root, args, ctx) => ctx.prisma.challenge.solveChallenge(args.nonce, args.signature),
});
