import {
  mutationField,
  nonNull,
  stringArg,
  queryField,
  list,
} from 'nexus/dist';
import { extendSession } from './model';

export const listSessions = queryField('sessions', {
  type: list('Session'),
  resolve: async (_, __, ctx) => {
    const { createdBy } = await ctx.getSession();
    const sessions = await ctx.prisma.session.listSessions(createdBy);
    return sessions.map(extendSession);
  },
});

export const revoke = mutationField('revokeSession', {
  type: 'Session',
  args: {
    sessionId: nonNull(stringArg()),
  },
  resolve: async (_parent, { sessionId }, ctx) => {
    const userId = (await ctx.getSession()).createdBy;
    return extendSession(await ctx.prisma.session.revoke(sessionId, userId));
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
    const { createdBy } = await ctx.getSession();
    const result = await ctx.prisma.session.createCustomSession(createdBy, session, true);
    return {
      ...result,
      session: extendSession(result.session),
    };
  },
});
