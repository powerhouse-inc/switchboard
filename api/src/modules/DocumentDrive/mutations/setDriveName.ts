import { mutationField, nonNull } from 'nexus';
import { SetDriveNameInput } from '../definitions';

export const setDriveName = mutationField('setDriveName', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(SetDriveNameInput),
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
