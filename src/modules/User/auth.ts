import { ApolloError } from 'apollo-server-core';
import { rule, shield } from 'graphql-shield';
import { JwtVerificationResult } from '../../types';

const getErrorFromJwtVerificationResult = (err: JwtVerificationResult | null) => {
  if (err && err.error === 'JwtExpired') {
    return new ApolloError('Your session has expired. Please log in again.', 'JWT_EXPIRED');
  }
  return new ApolloError('Not authorized', 'NOT_AUTHORIZED');
};

const ensureAuthenticated = (verification: JwtVerificationResult | null) => {
  if (!verification || !('userId' in verification)) {
    return getErrorFromJwtVerificationResult(verification);
  }
  return true;
};

const rules = {
  isAuthenticatedUser: rule()(
    (_, __, { authVerificationResult }) => ensureAuthenticated(authVerificationResult),
  ),
};

export const permissionsAuth = shield(
  {
    Query: {
      me: rules.isAuthenticatedUser,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV !== 'production',
  },
);
