import { mutationField, nonNull } from 'nexus';
import { AddFolderInput } from '../definitions';

export const addFolder = mutationField('addFolder', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(AddFolderInput),
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
