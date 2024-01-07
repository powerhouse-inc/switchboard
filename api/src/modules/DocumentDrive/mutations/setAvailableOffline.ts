import { mutationField, nonNull } from 'nexus';
import { SetAvailableOfflineInput } from '../definitions';

export const setAvailableOffline = mutationField('setAvailableOffline', {
  type: 'Boolean',
  args: {
    drive: nonNull('String'),
    operation: nonNull(SetAvailableOfflineInput),
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
