import {
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg
} from 'nexus';
import DocumentDriveError from '../../errors/DocumentDriveError';
import { Context } from '../../graphql/server/drive/context';
import logger from '../../logger';
import { DocumentDriveLocalState, DocumentDriveState } from './resolvers';
import { checkUserIsAdmin } from './utils';

export const DocumentDriveLocalStateInput = inputObjectType({
  name: 'DocumentDriveLocalStateInput',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  }
});
export const DocumentDriveStateInput = inputObjectType({
  name: 'DocumentDriveStateInput',
  definition(t) {
    t.id('id');
    t.nonNull.string('name');
    t.string('icon');
    t.string('slug');
  }
});

export const SetDriveIconInput = inputObjectType({
  name: 'SetDriveIconInput',
  definition(t) {
    t.nonNull.string('icon');
  }
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
  }
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
  }
});

const addDriveResponseDefinition = objectType({
  name: 'AddDriveResponse',
  definition(t) {
    t.nonNull.field('global', {
      type: DocumentDriveState
    });
    t.nonNull.field('local', {
      type: DocumentDriveLocalState
    });
  }
});

// protected routes
export const addDrive = mutationField('addDrive', {
  type: addDriveResponseDefinition,
  args: {
    global: nonNull(DocumentDriveStateInput),
    local: nonNull(DocumentDriveLocalStateInput)
  },
  resolve: async (_parent, { global, local }, ctx: Context) => {
    await checkUserIsAdmin(ctx);
    try {
      const drive = await ctx.prisma.document.addDrive({
        global: {
          id: global.id,
          name: global.name,
          icon: global.icon ?? null,
          slug: global.slug ?? null
        },
        local: {
          availableOffline: local.availableOffline,
          sharingType: local.sharingType ?? null,
          listeners: [],
          triggers: []
        }
      });
      return drive.state;
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to add drive',
        logging: true,
        context: e
      });
    }
  }
});

export const deleteDrive = mutationField('deleteDrive', {
  type: 'Boolean',
  args: {
    id: nonNull('String')
  },
  resolve: async (_parent, { id }, ctx: Context) => {
    await checkUserIsAdmin(ctx);
    try {
      await ctx.prisma.document.deleteDrive(id);
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to delete drive',
        logging: true,
        context: e
      });
    }

    return true;
  }
});

export const setDriveIcon = mutationField('setDriveIcon', {
  type: 'Boolean',
  args: {
    id: nonNull('String'),
    icon: nonNull('String')
  },
  resolve: async (_parent, { id, icon }, ctx: Context) => {
    await checkUserIsAdmin(ctx);
    const result = await ctx.prisma.document.setDriveIcon(id, icon);
    if (result.status !== 'SUCCESS') {
      if (result.error) {
        const { message } = result.error;
        throw new DocumentDriveError({ code: 500, message, logging: true });
      }

      throw new DocumentDriveError({
        code: 500,
        message: 'Failed to set drive icon',
        logging: true
      });
    }
    return true;
  }
});

export const setDriveName = mutationField('setDriveName', {
  type: 'Boolean',
  args: {
    id: nonNull('String'),
    name: nonNull('String')
  },
  resolve: async (_parent, { id, name }, ctx: Context) => {
    await checkUserIsAdmin(ctx);
    const result = await ctx.prisma.document.setDriveName(id, name);
    if (result.status !== 'SUCCESS') {
      if (result.error) {
        const { message } = result.error;
        throw new DocumentDriveError({ code: 500, message, logging: true });
      }

      throw new DocumentDriveError({
        code: 500,
        message: 'Failed to set drive icon',
        logging: true
      });
    }
    return true;
  }
});
