import { ApolloError } from 'apollo-server-core';
import { JwtVerificationResult } from '../types';

const getErrorFromJwtVerificationResult = (err: UnsuccessfulAuthentication | null) => {
  if (err && err.error === 'JwtExpired') {
    return new ApolloError('Your session has expired. Please log in again.', 'JWT_EXPIRED');
  }
  return new ApolloError('Not authorized', 'NOT_AUTHORIZED');
};

export const ensureAuthenticated = (verification: JwtVerificationResult | null) => {
  if (!verification || !('userId' in verification)) {
    return getErrorFromJwtVerificationResult(verification);
  }
  return true;
};
