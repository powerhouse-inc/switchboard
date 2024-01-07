import { nonNull, queryField } from 'nexus';
import { Document } from '../definitions';

export const getDocument = queryField('document', {
  type: Document,
  args: {
    drive: nonNull('String'),
    id: nonNull('String'),
  },
  resolve: async (_parent, { drive, id }, ctx) => {
    try {
      return await ctx.prisma.drive.getDocument(drive, id);
    } catch (e) {
      return null;
    }
  },
});
