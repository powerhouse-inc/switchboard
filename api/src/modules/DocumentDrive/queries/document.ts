import { nonNull, queryField } from 'nexus';
import { DocumentDriveState } from '../definitions';

export const getDocument = queryField('document', {
  type: DocumentDriveState,
  args: {
    driveId: nonNull('String'),
    id: nonNull('String'),
  },
  resolve: async (_parent, { driveId, id }, ctx) => {
    try {
      const drive = await ctx.prisma.document.getDocument(driveId, id);
      return drive;
    } catch (e) {
      return null;
    }
  },
});
