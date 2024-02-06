import {
  idArg,
  list, objectType, queryField,
} from 'nexus';
import { systemType } from '../system';
import { StrandUpdate } from './definitions';

export const syncType = objectType({
  name: 'Sync',
  definition(t) {
    t.field('strands', {
      type: list(StrandUpdate),
      args: {
        listenerId: idArg(),
        since: 'Date',
      },
      resolve: async (_parent, { listenerId, since }, ctx) => {
        if (!listenerId) throw new Error('Listener ID is required');
        try {
          const result = await ctx.prisma.document.pullStrands(
            ctx.driveId ?? '1',
            listenerId,
            since,
          );
          return result.map((e) => ({
            driveId: e.driveId,
            documentId: e.documentId,
            scope: e.scope,
            branch: e.branch,
            operations: e.operations.map((o) => ({
              revision: o.index,
              skip: o.skip,
              name: o.type,
              inputJson: JSON.stringify(o.input),
              stateHash: o.hash,
            })),
          }));
        } catch (e) {
          throw new Error('Failed to fetch strands');
        }
      },
    });
  },
});

export const driveSystemType = objectType({
  name: 'DriveSystem',
  definition(t) {
    t.implements(systemType);
    t.field('sync', {
      type: syncType,
      resolve: async () => true,
    });
  },
});

export const driveSystemQueryField = queryField('system', {
  type: driveSystemType,
  resolve: async () => true,
});
