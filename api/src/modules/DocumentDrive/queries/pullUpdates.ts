import { idArg, list, nonNull, queryField, stringArg } from 'nexus';
import { ListenerRevision, StrandUpdate } from '../definitions';

export const strands = queryField('strands', {
  type: list(StrandUpdate),
  args: {
    listenerId: idArg(),
    revisions: list(ListenerRevision),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      // @todo: fetch strands from connect drive server
      return [];
    } catch (e) {
      return [];
    }
  },
});

export const strandsSince = queryField('strandsSince', {
  type: list(StrandUpdate),
  args: {
    listenerId: idArg(),
    since: 'Date',
  },
  resolve: async (_parent, args, ctx) => {
    try {
      // @todo: fetch strands from connect drive server
      return [];
    } catch (e) {
      return [];
    }
  },
});

export const acknowledge = queryField('acknowledge', {
  type: 'Boolean',
  args: {
    listenerId: idArg(),
    revisions: list(ListenerRevision),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      // do something
      return true;
    } catch (e) {
      return false;
    }
  },
});
