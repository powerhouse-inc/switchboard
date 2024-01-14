import { list, queryField } from 'nexus';

export const getDrives = queryField('drives', {
  type: list('String'),
  resolve: async (_parent, args, ctx) => {
    try {
      return await ctx.prisma.document.getDrives();
    } catch (e) {
      return [];
    }
  },
});
