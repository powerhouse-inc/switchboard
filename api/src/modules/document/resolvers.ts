import { interfaceType, nonNull, objectType, queryField } from 'nexus';

export const documentModelInterface = interfaceType({
  name: 'Document',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('type');
  },
  resolveType: (e) => {
    if (e.type === 'business-statement') {
      return 'Drive';
    }

    if (e.type === 'folder') {
      return 'Folder';
    }

    return 'Document';
  },
});

export const defaultDocument = objectType({
  name: 'DocumentModelDocument',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('type');
    t.nonNull.string('content');
  },
});

export const documentQuery = queryField('document', {
  type: documentModelInterface,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_root, { id }, ctx) => ctx.prisma.document.getDocument(ctx.driveId, id),
});
