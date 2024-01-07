import { mutationField, nonNull } from 'nexus';
import { AddFileInput } from '../definitions';

export const addFile = mutationField('addFile', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(AddFileInput),
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
