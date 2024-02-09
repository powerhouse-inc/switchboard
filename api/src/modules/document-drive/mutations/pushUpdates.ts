import { list, mutationField, nonNull } from 'nexus';

import {
  ListenerRevision as IListenerRevision,
  UpdateStatus,
} from 'document-drive';
import { OperationScope } from 'document-model/dist/node/src/document';
import { InputStrandUpdate, ListenerRevision } from '../drive-resolver';

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, { strands }, ctx) => {
    // @todo: get connect drive server from ctx and apply updates
    if (!strands || strands?.length === 0) return [];

    const listenerRevisions: IListenerRevision[] = await Promise.all(strands.map(async (s) => {
      const operations = s.operations?.map((o) => ({
        ...o,
        input: JSON.parse(o.input),
        skip: o.skip ?? 0,
        scope: s.scope as OperationScope,
        branch: 'main',
        scopes: ['global', 'local'],
      })) ?? [];

      const result = await ctx.prisma.document.pushUpdates(
        s.driveId,
        operations,
        s.documentId ?? undefined,
      );

      return {
        branch: s.branch,
        documentId: s.documentId ?? '',
        driveId: s.driveId,
        revision: result.operations.pop()?.index ?? -1,
        scope: s.scope as OperationScope,
        status: (result.error ? 'ERROR' : 'SUCCESS') as UpdateStatus,
      };
    }));

    return listenerRevisions;
  },
});
