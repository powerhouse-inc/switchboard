import {
  mutationField,
  nonNull,
  stringArg,
  queryField,
  list,
} from 'nexus/dist';

export const listSessions = queryField('sessions', {
  type: list('Session'),
  resolve: async (_, __, ctx) => {
    const { createdBy } = await ctx.getSessionByToken();
    return ctx.prisma.session.listSessions(createdBy);
  },
});

export const revoke = mutationField('revokeSession', {
  type: 'Session',
  args: {
    sessionId: nonNull(stringArg()),
  },
  resolve: async (_parent, { sessionId }, ctx) => {
    const userId = (await ctx.getSessionByToken()).createdBy;
    return ctx.prisma.session.revoke(sessionId, userId);
  },
});

export const create = mutationField('createSession', {
  type: 'SessionCreateOutput',
  args: {
    session: nonNull('SessionCreate'),
  },
  resolve: async (
    _parent,
    { session },
    ctx,
  ) => {
    const { createdBy } = await ctx.getSessionByToken();
    return ctx.prisma.session.createCustomSession(createdBy, session, true);
  },
});
