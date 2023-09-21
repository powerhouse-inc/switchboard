import { objectType } from 'nexus/dist';

export const Counter = objectType({
  name: 'Counter',
  definition(t) {
    t.nonNull.string('message');
    t.nonNull.string('count');
  },
});

