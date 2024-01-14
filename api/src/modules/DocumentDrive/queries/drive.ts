import { nonNull, queryField } from 'nexus';
import { DocumentDriveState } from '../definitions';

export const getDrive = queryField('drive', {
  type: DocumentDriveState,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_parent, { id }, ctx) => {
    try {
      const drive = await ctx.prisma.document.getDrive(id);
      return drive.global;
    } catch (e) {
      return null;
    }
  },
});
