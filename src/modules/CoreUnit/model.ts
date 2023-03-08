import { objectType } from 'nexus/dist';

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
