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
    const { id } = await ctx.getUser();
    return ctx.prisma.session.listSessions(id);
  },
});

export const revoke = mutationField('revokeSession', {
  type: 'Session',
  args: {
    sessionId: nonNull(stringArg()),
  },
  resolve: async (_parent, { sessionId }, ctx) => {
    const userId = (await ctx.getUser()).id;
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
    { session }: { session: { referenceExpiryDate?: Date; name: string } },
    ctx,
  ) => {
    const { id } = await ctx.getUser();
    return ctx.prisma.session.generateTokenAndSession(id, session, true);
  },
});