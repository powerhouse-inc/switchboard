import { nonNull, queryField } from 'nexus';
import { DocumentDriveState } from '../definitions';

export const getDrive = queryField('drive', {
  type: DocumentDriveState,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_parent, { id }, ctx) => {
    try {
      const drive = await ctx.prisma.drive.getDrive(id);
      const response = {
        id: drive.id,
        name: drive.name,
        icon: drive.icon,
        remoteUrl: drive.remoteUrl,
        nodes: drive.nodes
      };

      return drive;
    } catch (e) {
      return null;
    }
  },
});
