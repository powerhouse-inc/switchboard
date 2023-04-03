import builder from '../builder';

export const CoreUnit = builder.prismaObject('CoreUnit', {
  name: 'CoreUnit',
  description: 'CoreUnit',
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.exposeString('code'),
    shortCode: t.exposeString('shortCode'),
    name: t.exposeString('name'),
    imageSource: t.exposeString('imageSource'),
    descriptionSentence: t.exposeString('descriptionSentence'),
    descriptionParagraph: t.exposeString('descriptionParagraph'),
    descriptionParagraphImageSource: t.exposeString(
      'descriptionParagraphImageSource',
    ),
  }),
});
