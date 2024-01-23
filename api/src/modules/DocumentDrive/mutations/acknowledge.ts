import { list, mutationField, nonNull } from "nexus";
import { ListenerRevisionInput } from "../definitions";
import { ListenerRevision, UpdateStatus } from "document-drive";

export const acknowledge = mutationField("acknowledge", {
  type: "Boolean",
  args: {
    listenerId: nonNull("String"),
    revisions: nonNull(list(nonNull(ListenerRevisionInput))),
  },
  resolve: async (_parent, { revisions, listenerId }, ctx) => {
    try {
      if (!listenerId || !revisions) return false;
      const validEntries: ListenerRevision[] = revisions
        .filter((r) => r !== null)
        .map((e) => ({
          driveId: ctx.driveId ?? "1",
          documentId: e!.documentId,
          scope: e!.scope,
          branch: e!.branch,
          revision: e!.revision,
          status: e!.status as UpdateStatus,
        }));

      return await ctx.prisma.document.acknowledgeStrands(
        ctx.driveId ?? "1",
        listenerId,
        validEntries
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  },
});
