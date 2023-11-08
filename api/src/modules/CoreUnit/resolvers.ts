import {
  stringArg, list, queryField, objectType,
} from 'nexus/dist';

export const CoreUnit = objectType({
  name: 'CoreUnit',
  definition(t) {
    t.string('id');
    t.string('code');
    t.string('shortCode');
    t.string('name');
    t.string('imageSource');
    t.string('descriptionSentence');
    t.string('descriptionParagraph');
    t.string('descriptionParagraphImageSource');
  },
});

export const coreUnits = queryField('coreUnits', {
  type: list('CoreUnit'),
  resolve: async (_parent, _args, ctx) => {
    const response = await ctx.prisma.coreUnit.findMany();
    return response;
  },
});

export const coreUnit = queryField('coreUnit', {
  type: 'CoreUnit',
  args: { id: stringArg() },
  resolve: async (_parent, { id }, ctx) => {
    if (!id) {
      throw new Error('please provide id');
    }
    return ctx.prisma.coreUnit.findUnique({
      where: {
        id,
      },
    });
  },
});
