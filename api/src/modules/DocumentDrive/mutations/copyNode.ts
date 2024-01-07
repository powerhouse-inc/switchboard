import { mutationField, nonNull } from 'nexus';
import { CopyNodeInput } from '../definitions';

export const copyNode = mutationField('copyNode', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(CopyNodeInput),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      ctx.prisma.drive.addOperation(args);
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  },
});
