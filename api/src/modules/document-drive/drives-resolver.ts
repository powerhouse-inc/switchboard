import {
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
} from 'nexus';
import { DocumentDriveState } from './drive-resolver';
import { Context } from '../../graphql/server/drive/context';
import logger from '../../logger';

export const DocumentDriveLocalState = objectType({
  name: 'DocumentDriveLocalState',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  },
});

export const DocumentDriveLocalStateInput = inputObjectType({
  name: 'DocumentDriveLocalStateInput',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  },
});
export const DocumentDriveStateInput = inputObjectType({
  name: 'DocumentDriveStateInput',
  definition(t) {
    t.id('id');
    t.nonNull.string('name');
    t.string('icon');
    t.string('slug');
  },
});

export const getDrives = queryField('drives', {
  type: list('String'),
  resolve: async (_parent, args, ctx: Context) => {
    try {
      const drives = await ctx.prisma.document.getDrives();
      return drives;
    } catch (e) {
      logger.error(e);
      throw new Error('Failed to get drives.');
    }
  },
});

const addDriveResponseDefinition = objectType({
  name: 'AddDriveResponse',
  definition(t) {
    t.nonNull.field('global', {
      type: DocumentDriveState
    });
    t.nonNull.field('local', {
      type: DocumentDriveLocalState,
    });
  },
});


export const addDrive = mutationField('addDrive', {
  type: addDriveResponseDefinition,
  args: {
    global: nonNull(DocumentDriveStateInput),
    local: nonNull(DocumentDriveLocalStateInput),
  },
  resolve: async (_parent, { global, local }, ctx: Context) => {
    const drive = await ctx.prisma.document.addDrive({
      global: { id: global.id, name: global.name, icon: global.icon ?? null, slug: global.slug ?? null },
      local: { availableOffline: local.availableOffline, sharingType: local.sharingType ?? null, listeners: [], triggers: [] },
    });
    return drive.state;
  },
});

export const deleteDrive = mutationField('deleteDrive', {
  type: 'Boolean',
  args: {
    id: nonNull('String'),
  },
  resolve: async (_parent, { id }, ctx: Context) => {
    try {
      await ctx.prisma.document.deleteDrive(id);
    } catch (e) {
      logger.error(e);
      return false;
    }

    return true;
  },
});
