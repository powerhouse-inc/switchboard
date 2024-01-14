import { list, mutationField, nonNull } from 'nexus';
import { InputStrandUpdate, ListenerRevision } from '../definitions';
import { OperationScope } from 'document-model/document';
import { Operation } from 'document-model/dist/browser/document';

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, { strands }, ctx) => {
    //@todo: get connect drive server from ctx and apply updates
    // if (!strands || strands?.length === 0) return [[]];
    // await Promise.all(
    //   strands.map((s) => {
    //     return Promise.all(
    //       s.operations?.map((o) => {
    //         const op: Operation = {
    //           scope: s.scope as OperationScope,
    //           ...o,
    //           index: o.revision,
    //           timestamp: new Date().toISOString(),
    //           hash: '',
    //         };
    //         const result = ctx.prisma.document.addOperation(
    //           s.driveId,
    //           s.documentId,
    //           op,
    //         );
    return [];
  },
});
