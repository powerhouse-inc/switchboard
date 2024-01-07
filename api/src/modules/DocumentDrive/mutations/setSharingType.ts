import { mutationField, nonNull } from 'nexus';
import { SetSharingTypeInput } from '../definitions';

export const setSharingType = mutationField('setSharingType', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(SetSharingTypeInput),
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
