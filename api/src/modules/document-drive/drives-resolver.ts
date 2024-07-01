import {
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';
import { DocumentDriveStateObject } from './drive-resolver';
import { Context } from '../../graphql/server/drive/context';
import logger from '../../logger';
import DocumentDriveError from '../../errors/DocumentDriveError';

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

export const getDriveBySlug = queryField('driveIdBySlug', {
  type: 'String',
  args: {
    slug: stringArg()
  },
  resolve: async (_parent, args, ctx: Context) => {
    try {
      const drive = await ctx.prisma.document.getDriveBySlug(args.slug);
      return drive.id;
    } catch (e) {
      logger.error(e);
      throw new Error('Drive not found.');
    }
  },
});

const addDriveResponseDefinition = objectType({
  name: 'AddDriveResponse',
  definition(t) {
    t.nonNull.field('global', {
      type: DocumentDriveStateObject
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
    try {
      const drive = await ctx.prisma.document.addDrive({
        global: { id: global.id, name: global.name, icon: global.icon ?? null, slug: global.slug ?? null },
        local: { availableOffline: local.availableOffline, sharingType: local.sharingType ?? null, listeners: [], triggers: [] },
      });
      return drive.state;
    } catch (e: any) {
      throw new DocumentDriveError({ code: 500, message: e.message ?? "Failed to add drive", logging: true, context: e })
    }
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
    } catch (e: any) {
      throw new DocumentDriveError({ code: 500, message: e.message ?? "Failed to delete drive", logging: true, context: e })
    }

    return true;
  },
});
