import {
  mutationField,
  nonNull,
  stringArg,
  queryField,
  list,
  inputObjectType,
  objectType,
} from 'nexus/dist';

export const Session = objectType({
  name: 'Session',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.date('createdAt');
    t.nonNull.string('createdBy');
    t.date('referenceExpiryDate');
    t.nonNull.string('referenceTokenId');
    t.nonNull.boolean('isUserCreated');
    t.string('name');
    t.date('revokedAt');
    t.string('allowedOrigins');
  },
});

export const SessionInput = inputObjectType({
  name: 'SessionInput',
  definition(t) {
    t.int('expiryDurationSeconds');
    t.nonNull.string('name');
    t.nonNull.string('allowedOrigins');
  },
});

export const SessionOutput = objectType({
  name: 'SessionOutput',
  definition(t) {
    t.nonNull.field('session', { type: 'Session' });
    t.nonNull.string('token');
  },
});

export const revoke = mutationField('revokeSession', {
  type: 'Session',
  args: {
    sessionId: nonNull(stringArg()),
  },
  resolve: async (_parent, { sessionId }, ctx) => {
    const userId = (await ctx.getSession()).createdBy;
    return ctx.prisma.session.revoke(sessionId, userId);
  },
});

export const create = mutationField('createSession', {
  type: 'SessionOutput',
  args: {
    session: nonNull('SessionInput'),
  },
  resolve: async (
    _parent,
    { session },
    ctx,
  ) => {
    const { createdBy } = await ctx.getSession();
    return ctx.prisma.session.createCustomSession(createdBy, session, true);
  },
});
