import { list, mutationField, nonNull } from "nexus";
import { InputStrandUpdate, ListenerRevision } from "../definitions";
import { OperationScope } from "document-model/document";
import {
  ListenerRevision as IListenerRevision,
  UpdateStatus,
} from "document-drive";

export const pushUpdates = mutationField("pushUpdates", {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, { strands }, ctx) => {
    //@todo: get connect drive server from ctx and apply updates

    if (!strands || strands?.length === 0) return [];
    const listenerRevisions: IListenerRevision[] = [];
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
          const result = await ctx.prisma.document.pushUpdates(
            s.driveId,
            s.documentId,
            operations
          );

          listenerRevisions.push({
            branch: s.branch,
            documentId: s.documentId,
            driveId: s.driveId,
            revision: result.operations.pop().revision,
            scope: s.scope as OperationScope,
            status: (result.error ? "ERROR" : "SUCCESS") as UpdateStatus,
          });
        } catch (e) {
          console.log(e);
        }
      })
    );

    return listenerRevisions;
  },
});
