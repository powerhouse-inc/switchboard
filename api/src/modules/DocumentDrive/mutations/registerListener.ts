import { list, mutationField, nonNull } from "nexus";
import {
  InputListenerFilter,
  InputStrandUpdate,
  Listener,
  ListenerRevision,
} from "../definitions";

export const registerListener = mutationField("registerPullResponderListener", {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter),
  },
  resolve: async (_parent, { filter }, ctx) => {
    try {
      const result = await ctx.prisma.document.registerPullResponderListener(
        ctx.driveId ?? "1",
        filter
      );

      return result;
    } catch (e) {
      console.log(e);
    }
  },
});
