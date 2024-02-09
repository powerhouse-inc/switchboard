import { mutationField, nonNull } from 'nexus';
import {
  InputListenerFilter,
  Listener,
} from '../drive-resolver';

export const deleteListener = mutationField('deletePullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter),
  },
  resolve: async (_parent, { filter }, ctx) => {
    const result = await ctx.prisma.document.deletePullResponderListener(
      ctx.driveId ?? '1',
      filter,
    );

    return result;
  },
});
