import { list, queryField } from 'nexus';

export const getDrives = queryField('drives', {
  type: list('String'),
  resolve: async (_parent, args, ctx) => {
    try {
      const drives = await ctx.prisma.document.getDrives();
      return drives;
    } catch (e) {
      throw new Error('Failed to get drives.');
    }
  },
});
