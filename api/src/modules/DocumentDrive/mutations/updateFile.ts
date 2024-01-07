import { mutationField, nonNull } from 'nexus';
import { UpdateFileInput } from '../definitions';

export const updateFile = mutationField('updateFile', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(UpdateFileInput),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      await ctx.prisma.drive.addOperation(args);
    } catch (e) {
      return false;
    }

    return true;
  },
});
