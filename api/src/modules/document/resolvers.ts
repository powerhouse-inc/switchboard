import { interfaceType, nonNull, queryField } from 'nexus';
import { GQLDateBase } from '../system';

// todo: resolveType should be moved to somewhere else
export const operationModelInterface = interfaceType({
  name: 'Operation',
  definition(t) {
    t.nonNull.string('type');
    t.nonNull.int('index');
    t.nonNull.field('timestamp', { type: GQLDateBase });
    t.nonNull.string('hash');
  },
  resolveType: (e) => 'Operation',
});

// todo: resolveType should be moved to somewhere else
export const documentModelInterface = interfaceType({
  name: 'Document',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('documentType');
    t.nonNull.int('revision');
    t.nonNull.field('created', { type: GQLDateBase });
    t.nonNull.field('lastModified', { type: GQLDateBase });
    t.nonNull.list.nonNull.field('operations', { type: operationModelInterface });
  },
  resolveType: (e) => e.name,
});

export const documentQuery = queryField('document', {
  type: documentModelInterface,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_root, { id }, ctx) => {
    const doc = await ctx.prisma.document.getDocument(ctx.driveId, id);
    return doc;
  },
});
