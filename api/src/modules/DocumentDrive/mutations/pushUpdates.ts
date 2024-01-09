import { list, mutationField, nonNull } from 'nexus';
import { InputStrandUpdate, ListenerRevision } from '../definitions';

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, args, ctx) => {
    try {
      //@todo: get connect drive server from ctx and apply updates
      return [];
    } catch (e) {
      console.log(e);
      return [];
    }
  },
});
