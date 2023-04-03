import builder from '../builder';
import prisma from '../../database';
import { Session, SessionCreateOutput, SessionCreate } from './model';

builder.queryField('sessions', (t) => t.field({
  type: t.listRef(Session, { nullable: false }),
  resolve: async (_parent, _args, ctx) => {
    const session = await ctx.getSession();
    return prisma.session.listSessions(session.creator.id);
  },
}));

builder.mutationField('revokeSession', (t) => t.field({
  type: Session,
  args: {
    sessionId: t.arg({
      type: 'String',
      required: true,
    }),
  },
  resolve: async (_parent, { sessionId }, ctx) => {
    const session = await ctx.getSession();
    return prisma.session.revoke(sessionId, session.creator.id);
  },
}));

builder.mutationField('createSession', (t) => t.field({
  type: SessionCreateOutput,
  args: {
    session: t.arg({
      type: SessionCreate,
      required: true,
    }),
  },
  resolve: async (_parent, { session: s }, ctx) => {
    const session = await ctx.getSession();
    return prisma.session.createCustomSession(session.creator.id, s, true);
  },
}));
