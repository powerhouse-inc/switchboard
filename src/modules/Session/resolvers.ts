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
    const id = await ctx.getUserId();
    return ctx.prisma.session.listSessions(id);
  },
});

export const revoke = mutationField('revokeSession', {
  type: 'Session',
  args: {
    sessionId: nonNull(stringArg()),
  },
  resolve: async (_parent, { sessionId }, ctx) => ctx.prisma.session.revoke(sessionId),
});

export const create = mutationField('createSession', {
  type: 'SessionCreateOutput',
  args: {
    session: nonNull('SessionCreate'),
  },
  resolve: async (
    _parent,
    { session }: { session: { referenceExpiryDate: Date; name: string } },
    ctx,
  ) => {
    const id = await ctx.getUserId();
    const {
      createdSession,
      createdToken,
    } = await ctx.prisma.session.generateTokenAndSession(id, session);
    return { createdSession, token: createdToken };
  },
});
