import { mutationField, nonNull } from 'nexus';
import {
  DocumentDriveLocalStateInput,
  DocumentDriveStateInput,
} from '../definitions';

export const addDrive = mutationField('addDrive', {
  type: 'Boolean',
  args: {
    global: nonNull(DocumentDriveStateInput),
    local: nonNull(DocumentDriveLocalStateInput),
  },
  resolve: async (_parent, { global, local }, ctx) => {
    try {
      await ctx.prisma.drive.addDrive({
        global: { ...global, nodes: [] },
        local,
      });
    } catch (e) {
      return false;
    }

    return true;
  },
});
