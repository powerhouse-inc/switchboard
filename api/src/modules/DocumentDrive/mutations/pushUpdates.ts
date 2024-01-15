import { list, mutationField, nonNull } from 'nexus';
import {
  InputStrandUpdate,
  ListenerRevision,
  UpdateStatus,
} from '../definitions';
import { OperationScope } from 'document-model/document';
import { Operation } from 'document-model/dist/browser/document';
import e from 'express';

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, { strands }, ctx) => {
    //@todo: get connect drive server from ctx and apply updates

    if (!strands || strands?.length === 0) return [[]];
    const results = await Promise.all(
      strands.map(async (s) => {
        const operations = s.operations?.map((o) => {
          const op = {
            scope: s.scope as OperationScope,
            branch: s.branch,
            ...o,
            input: JSON.parse(o.input),
          };

          return op;
        });
        try {
          const result = await ctx.prisma.document.addDriveOperations(
            s.driveId,
            operations,
          );
          console.log(result);
          return result;
        } catch (e) {
          console.log(e);
          return null;
        }
      }),
    );
    return strands.map((r, i) => {
      // if (!result) return null;
      return {
        driveId: r.driveId,
        documentId: r.documentId,
        scope: r.scope,
        branch: r.branch,
        status: 'SUCCESS',
        revision: r.operations[r.operations.length - 1].index + 1,
      };
    });
  },
});
