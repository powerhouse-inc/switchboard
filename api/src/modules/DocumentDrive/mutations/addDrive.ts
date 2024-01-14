import { mutationField, nonNull, objectType } from 'nexus';
import { GraphQLJSONObject } from 'graphql-type-json';
import { scalarType } from 'nexus';

import {
  DocumentDriveLocalState,
  DocumentDriveLocalStateInput,
  DocumentDriveState,
  DocumentDriveStateInput,
} from '../definitions';

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
    return await ctx.prisma.document.addDrive({
      global: { ...global, nodes: [] },
      local,
    });
  },
});
