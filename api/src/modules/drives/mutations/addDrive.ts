import { mutationField, nonNull, objectType } from 'nexus';

import {
  DocumentDriveLocalState,
  DocumentDriveLocalStateInput,
  DocumentDriveStateInput,
} from '../definitions';
import { DocumentDriveState } from '../../drive/definitions';

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
