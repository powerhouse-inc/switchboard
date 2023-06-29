import builder from 'gql-query-builder';
import { fetchOrThrow } from './server';

interface Session {
  id: string;
  name: string;
  referenceExpiryDate: string;
  referenceTokenId: string;
  isUserCreated: boolean;
  allowedOrigins: string;
  revokedAt: string;
  createdAt: string;
}

const sessionFields = [
  'id',
  'name',
  'referenceExpiryDate',
  'referenceTokenId',
  'isUserCreated',
  'allowedOrigins',
  'revokedAt',
  'createdAt',
];

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
    fields: ['token', { session: sessionFields }],
  }),
);

export const me = () => fetchOrThrow<{ address: string }>(
  builder.query({
    operation: 'me',
    fields: ['address'],
  }),
);

export const sessions = () => fetchOrThrow<Session[]>(
  builder.query({
    operation: 'sessions',
    fields: sessionFields,
  }),
);

export const createSession = (
  name: string,
  allowedOrigins: string,
  expiryDurationSeconds?: number | null,
) => fetchOrThrow<{ token: string, session: Session }>(
  builder.mutation({
    operation: 'createSession',
    variables: {
      session: {
        value: {
          name,
          expiryDurationSeconds,
          allowedOrigins,
        },
        type: 'SessionInput',
        required: true,
      },
    },
    fields: ['token', { session: sessionFields }],
  }),
);

export const revokeSession = (sessionId: string) => fetchOrThrow<Session>(
  builder.mutation({
    operation: 'revokeSession',
    variables: {
      sessionId: {
        value: sessionId,
        type: 'String!',
      },
    },
    fields: sessionFields,
  }),
);
