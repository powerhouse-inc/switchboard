import { list, nonNull, queryField } from 'nexus';
import { Document } from '../definitions';

export const getDocuments = queryField('documents', {
  type: list('String'),
  args: {
    drive: nonNull('String'),
  },
  resolve: async (_parent, { drive }, ctx) => {
    try {
      return await ctx.prisma.drive.getDocuments(drive);
    } catch (e) {
      return [];
    }
  },
});
