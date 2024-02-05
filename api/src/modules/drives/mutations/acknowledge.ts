import { list, mutationField, nonNull } from 'nexus';
import { ListenerRevision, UpdateStatus } from 'document-drive';
import { ListenerRevisionInput } from '../definitions';

export const acknowledge = mutationField('acknowledge', {
  type: 'Boolean',
  args: {
    listenerId: nonNull('String'),
    revisions: list(ListenerRevisionInput),
  },
  resolve: async (_parent, { revisions, listenerId }, ctx) => {
    try {
      if (!listenerId || !revisions) return false;
      const validEntries: ListenerRevision[] = revisions
        .filter((r) => r !== null)
        .map((e) => ({
          driveId: ctx.driveId ?? '1',
          documentId: e!.documentId,
          scope: e!.scope,
          branch: e!.branch,
          revision: e!.revision,
          status: e!.status as UpdateStatus,
        }));

      return await ctx.prisma.document.acknowledgeStrands(
        ctx.driveId ?? '1',
        listenerId,
        validEntries,
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  },
});
