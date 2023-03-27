import { test, expect } from 'vitest';
import builder from 'gql-query-builder';
import { signUpMutation } from './helpers/const';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx, executeGraphQlQuery } from './helpers/server';

cleanDatabaseBeforeAfterEachTest();

function isRecent(dateA: Date, dateB: Date) {
  const diff = Math.abs(dateA.getTime() - dateB.getTime());
  return diff < 1000;
}

const listSessionsQuery = builder.query({
  operation: 'sessions',
  fields: ['id', 'name', 'createdAt', 'createdBy', 'referenceExpiryDate', 'revokedAt', 'referenceTokenId'],
});

const getRevokeSessionMutation = (sessionId: string) => builder.mutation({
  operation: 'revokeSession',
  variables: {
    sessionId: {
      value: sessionId,
      type: 'String!',
    },
  },
  fields: ['id', 'name', 'createdAt', 'createdBy', 'referenceExpiryDate', 'revokedAt', 'referenceTokenId'],
});

const getCreateSessionMutation = (name: string, referenceExpiryDate: Date) => builder.mutation({
  operation: 'createSession',
  variables: {
    session: {
      value: {
        name,
        referenceExpiryDate,
      },
      type: 'SessionCreate',
      required: true,
    },
  },
  fields: ['createdSession{name, id, referenceExpiryDate}', 'token'],
});

test('Auth session: list', async () => {
  const { token } = (await executeGraphQlQuery(signUpMutation) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  const executedAt = new Date();
  expect(sessionsResponse?.sessions?.length).toBe(1);
  const session = sessionsResponse?.sessions[0];
  expect(isRecent(new Date(session.createdAt), executedAt)).toBe(true);
});

test('Auth session: revoke', async () => {
  const { token } = (await executeGraphQlQuery(signUpMutation) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  const session = sessionsResponse?.sessions[0];
  const mutation = getRevokeSessionMutation(session.id);
  const revokeResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(revokeResponse?.revokeSession?.id).toBe(session.id);
  const revokedDate = new Date(revokeResponse?.revokeSession?.revokedAt);
  expect(isRecent(revokedDate, new Date())).toBe(true);
});

test('Auth session: create', async () => {
  const { token } = (await executeGraphQlQuery(signUpMutation) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const expiryDate = new Date();
  const name = 'JoJo';
  const mutation = getCreateSessionMutation(name, expiryDate);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(createResponse?.createSession?.createdSession.name).toBe(name);
  expect(
    createResponse?.createSession?.createdSession.referenceExpiryDate,
  ).toBe(expiryDate.toISOString());
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse?.sessions?.length).toBe(2);
});

test('Auth session: revoked session is forbidden', async () => {
  const { token } = (await executeGraphQlQuery(signUpMutation) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const expiryDate = new Date();
  expiryDate.setDate(new Date().getDate() + 1);
  const name = 'JoJo';
  let mutation = getCreateSessionMutation(name, expiryDate);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  const sessionId = createResponse?.createSession?.createdSession.id;
  mutation = getRevokeSessionMutation(sessionId);
  await executeGraphQlQuery(mutation);
  ctx.client.setHeader('Authorization', `Bearer ${createResponse.createSession.token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse.errors[0].message).toBe('Session expired');
});
