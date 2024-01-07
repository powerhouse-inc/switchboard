import { mutationField, nonNull } from 'nexus';
import { UpdateNodeInput } from '../definitions';

export const updateNode = mutationField('updateNode', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(UpdateNodeInput),
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
