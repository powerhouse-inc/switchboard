import { rule, shield } from 'graphql-shield';

const rules = {
  isAuthenticatedUser: rule()((_, __, { userId }) => Boolean(userId)),
};

export const permissions = shield(
  {
    Query: {
      me: rules.isAuthenticatedUser,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV !== 'production',
  },
);
