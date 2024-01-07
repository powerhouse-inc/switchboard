import { mutationField, nonNull } from 'nexus';
import { MoveNodeInput } from '../definitions';

export const moveNode = mutationField('moveNode', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(MoveNodeInput),
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
