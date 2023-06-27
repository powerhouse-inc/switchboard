import builder from 'gql-query-builder';
import { fetchOrThrow } from './server';

interface Session {
  id: string;
  referenceExpiryDate: string;
  isUserCreated: boolean;
}

export const createChallenge = (address: string) => fetchOrThrow<{ nonce: string, message: string }>(
  builder.mutation({
    operation: 'createChallenge',
    variables: {
      address: {
        value: address,
        type: 'String',
        required: true,
      },
    },
    fields: ['nonce', 'message'],
  }),
);

export const solveChallenge = (nonce: string, signature: string) => fetchOrThrow<{ token: string, session: Session }>(
  builder.mutation({
    operation: 'solveChallenge',
    variables: {
      nonce: {
        value: nonce,
        type: 'String',
        required: true,
      },
      signature: {
        value: signature,
        type: 'String',
        required: true,
      },
    },
    fields: ['token', 'session{ id, referenceExpiryDate, isUserCreated }'],
  }),
);

export const me = () => fetchOrThrow<{ address: string }>(
  builder.query({
    operation: 'me',
    fields: ['address'],
  }),
);
