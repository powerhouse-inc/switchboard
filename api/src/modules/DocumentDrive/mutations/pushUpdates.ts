import { list, mutationField, nonNull } from 'nexus';
import { InputStrandUpdate } from '../definitions';

export const pushUpdates = mutationField('pushUpdates', {
  type: 'Boolean',
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      //@todo: get connect drive server from ctx and apply updates
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  },
});
