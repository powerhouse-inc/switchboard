import { queryField } from 'nexus';
import { DocumentDriveState } from '../definitions';

export const getDrive = queryField('drive', {
  type: DocumentDriveState,
  resolve: async (_parent, args, ctx) => {
    try {
      const drive = await ctx.prisma.document.getDrive(ctx.driveId ?? '1');
      return drive.global;
    } catch (e) {
      return null;
    }
  },
});
