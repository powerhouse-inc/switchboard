import { objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('address');
    t.nonNull.date('createdAt');
  }
});
