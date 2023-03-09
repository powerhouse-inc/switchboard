import { nonNull, stringArg, subscriptionField } from 'nexus';
import { withFilter } from 'graphql-subscriptions';

export const USER_SIGNED_IN = 'USER_SIGNED_IN';
export const USER_UPDATED = 'USER_UPDATED';

export const userSignedIn = subscriptionField('userSignedIn', {
  type: 'User',
  args: {
    userId: nonNull(stringArg()),
  },
  subscribe: withFilter(
    (_, _args, ctx) => {
      const { pubsub } = ctx;

      return pubsub.asyncIterator(USER_SIGNED_IN);
    },
    (payload, { userId }) => payload.id === userId,
  ),
  resolve: (payload) => payload,
});
