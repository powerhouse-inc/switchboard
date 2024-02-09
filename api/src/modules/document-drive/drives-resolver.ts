import {
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
} from 'nexus';
import { DocumentDriveState } from './drive-resolver';

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
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.string('icon');
    t.string('slug');
  },
});

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

const addDriveResponseDefinition = objectType({
  name: 'AddDriveResponse',
  definition(t) {
    t.nonNull.field('global', {
      type: DocumentDriveState,
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
  resolve: async (_parent, { global, local }, ctx) => {
    await ctx;
    return ctx.prisma.document.addDrive({
      global: { ...global, nodes: [] },
      local: { ...local, listeners: [], triggers: [] },
    });
  },
});

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
