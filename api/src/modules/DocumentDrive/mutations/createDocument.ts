import { mutationField, nonNull } from "nexus";
import { CreateDocumentInput } from "../definitions";

export const createDocument = mutationField('createDocument', {
  type: 'Boolean',
  args: {
    driveId: nonNull('String'),
    input: nonNull(CreateDocumentInput),
  },
  resolve: (_parent, { driveId, input }, ctx) => {
    return ctx.prisma.drive.createDocument(driveId, input);
  },
});
