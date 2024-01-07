import { mutationField, nonNull } from 'nexus';
import { DeleteNodeInput } from '../definitions';

export const deleteNode = mutationField('deleteNode', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(DeleteNodeInput),
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
