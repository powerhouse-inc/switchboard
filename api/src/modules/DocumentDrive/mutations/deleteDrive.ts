import { mutationField, nonNull } from 'nexus';

export const deleteDrive = mutationField('deleteDrive', {
  type: 'Boolean',
  args: {
    id: nonNull('String'),
  },
  resolve: async (_parent, { id }, ctx) => {
    try {
      await ctx.prisma.drive.deleteDrive(id);
    } catch (e) {
      return false;
    }

    return true;
  },
});
