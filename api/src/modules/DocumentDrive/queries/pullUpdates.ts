import { idArg, list, mutationField, nonNull, queryField } from "nexus";
import { ListenerRevisionInput, StrandUpdate } from "../definitions";
import { ListenerRevision, ListenerStatus, UpdateStatus } from "document-drive";

export const strands = queryField("strands", {
  type: list(StrandUpdate),
  args: {
    listenerId: idArg(),
  },
  resolve: async (_parent, { listenerId }, ctx) => {
    try {
      const result = await ctx.prisma.document.pullStrands(
        ctx.driveId ?? "1",
        listenerId!
      );
      return result.map((e) => {
        return {
          driveId: e.driveId,
          documentId: e.documentId,
          scope: e.scope,
          branch: e.branch,
          operations: e.operations.map((o) => ({
            revision: o.revision,
            skip: o.skip,
            name: o.operation,
            inputJson: JSON.stringify(o.input),
            stateHash: o.hash,
          })),
        };
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  },
});

export const strandsSince = queryField("strandsSince", {
  type: list(StrandUpdate),
  args: {
    listenerId: idArg(),
    since: "Date",
  },
  resolve: async (_parent, { listenerId, since }, ctx) => {
    try {
      // @todo: fetch strands from connect drive server
      const result = await ctx.prisma.document.pullStrands(
        ctx.driveId ?? "1",
        listenerId!,
        since
      );
      return result.map((e) => {
        return {
          driveId: e.driveId,
          documentId: e.documentId,
          scope: e.scope,
          branch: e.branch,
          operations: e.operations.map((o) => ({
            revision: o.revision,
            skip: o.skip,
            name: o.operation,
            inputJson: JSON.stringify(o.input),
            stateHash: o.hash,
          })),
        };
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  },
});

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
