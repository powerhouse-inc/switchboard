import { nonNull, objectType, queryField, unionType } from 'nexus';
import { defaultDocument, documentModelInterface } from '../document';



export const rwaDocument = objectType({
  name: 'RwaDocument',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.string('field1');
  },
});


// export const unionDocuments = unionType({
//   name: 'Documents',
//   definition(t) {
//     t.members(documentModelInterface, defaultDocument, rwaDocument);
//   },
//   resolveType: () => true,
// });


export const documentssssQuery = queryField('document', {
  type: documentModelInterface,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_root, { id }, ctx) => ctx.prisma.document.getDocument(ctx.driveId, id),
});
