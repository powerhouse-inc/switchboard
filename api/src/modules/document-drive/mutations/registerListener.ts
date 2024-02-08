import { mutationField, nonNull } from 'nexus';
import {
  InputListenerFilter,
  Listener,
} from '../definitions';

export const registerListener = mutationField('registerPullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter),
  },
  resolve: async (_parent, { filter }, ctx) => {
    const result = await ctx.prisma.document.registerPullResponderListener(
      ctx.driveId ?? '1',
      filter,
    );

    return result;
  },
});
