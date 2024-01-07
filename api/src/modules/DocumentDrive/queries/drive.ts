import { nonNull, queryField } from 'nexus';
import { DocumentDriveState } from '../definitions';

export const getDrive = queryField('drive', {
  type: DocumentDriveState,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_parent, { id }, ctx) => {
    try {
      return await ctx.prisma.drive.getDrive(id);
    } catch (e) {
      return null;
    }
  },
});
