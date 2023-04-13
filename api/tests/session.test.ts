import { test, expect } from 'vitest';
import builder from 'gql-query-builder';
import { getSignUpMutation, meQuery, USERNAME } from './helpers/const';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { isRecent } from './helpers/time';
import { ctx, executeGraphQlQuery } from './helpers/server';

cleanDatabaseBeforeAfterEachTest();

const listSessionsQuery = builder.query({
  operation: 'sessions',
  fields: ['id', 'name', 'createdAt', 'createdBy', 'referenceExpiryDate', 'revokedAt', 'referenceTokenId', 'isUserCreated'],
});

const getRevokeSessionMutation = (sessionId: string) => builder.mutation({
  operation: 'revokeSession',
  variables: {
    sessionId: {
      value: sessionId,
      type: 'String!',
    },
  },
  fields: ['id', 'name', 'createdAt', 'createdBy', 'referenceExpiryDate', 'revokedAt', 'referenceTokenId', 'isUserCreated'],
});

const getCreateSessionMutation = (
  name: string,
  originRestriction: string,
  expiryDurationSeconds?: number | null,
) => builder.mutation({
  operation: 'createSession',
  variables: {
    session: {
      value: {
        name,
        expiryDurationSeconds,
        originRestriction
      },
      type: 'SessionCreate',
      required: true,
    },
  },
  fields: ['session{name, id, referenceExpiryDate, isUserCreated}', 'token'],
});

test('Auth session: list', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  const executedAt = new Date();
  expect(sessionsResponse?.sessions?.length).toBe(1);
  const session = sessionsResponse?.sessions[0];
  expect(isRecent(new Date(session.createdAt), executedAt)).toBe(true);
  expect(session.isUserCreated).toBe(false);
});

test('Auth session: list, no auth', async () => {
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse.errors[0].message).toBe('Not authenticated');
});

test('Auth session: revoke', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  const session = sessionsResponse?.sessions[0];
  const mutation = getRevokeSessionMutation(session.id);
  const revokeResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(revokeResponse?.revokeSession?.id).toBe(session.id);
  const revokedDate = new Date(revokeResponse?.revokeSession?.revokedAt);
  expect(isRecent(revokedDate, new Date())).toBe(true);
});

test('Auth session: revoke, no auth', async () => {
  const mutation = getRevokeSessionMutation('funny');
  const revokeResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(revokeResponse.errors[0].message).toBe('Not authenticated');
});

test('Auth session: revoke unexistant', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const mutation = getRevokeSessionMutation('asdf');
  const revokeResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(revokeResponse?.errors[0].message).toBe('Session not found');
  expect(revokeResponse?.errors[0].extensions.code).toBe('SESSION_NOT_FOUND');
});

test('Auth session: create expirable', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const name = 'JoJo';
  const expectedExpiryDate = new Date();
  const mutation = getCreateSessionMutation(name, '*', 1);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(createResponse?.createSession?.session.name).toBe(name);
  expect(
    isRecent(new Date(
      createResponse?.createSession?.session.referenceExpiryDate,
    ), expectedExpiryDate),
  ).toBe(true);
  const createdToken = createResponse?.createSession?.token;
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse?.sessions?.length).toBe(2);
  const userCreatedList: boolean[] = (
    sessionsResponse?.sessions.map((session: any) => session.isUserCreated)
  );
  expect(userCreatedList.some((i) => i)).toBe(true);
  ctx.client.setHeader('Authorization', `Bearer ${createdToken}`);
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 20));
  const meResponse = (await executeGraphQlQuery(meQuery)) as any;
  expect(meResponse?.errors?.length).toBe(1);
  expect(meResponse?.errors[0].message).toBe('Token expired');
});

test('Auth session: create unexpirable', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const name = 'JoJo';
  const mutation = getCreateSessionMutation(name, '*', null);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(createResponse?.createSession?.session.name).toBe(name);
  expect(
    createResponse?.createSession?.session.referenceExpiryDate,
  ).toBe(null);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse?.sessions?.length).toBe(2);
  const userCreatedList: boolean[] = (
    sessionsResponse?.sessions.map((session: any) => session.isUserCreated)
  );
  expect(userCreatedList.some((i) => i)).toBe(true);
  const customToken = createResponse?.createSession?.token;
  ctx.client.setHeader('Authorization', `Bearer ${customToken}`);
  const meResponse = (await executeGraphQlQuery(meQuery)) as any;
  expect(meResponse?.me?.username).toBe(USERNAME);
});

test('Auth session: revoked session is forbidden', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const name = 'JoJo';
  let mutation = getCreateSessionMutation(name, '*', 3600);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  const sessionId = createResponse?.createSession?.session.id;
  mutation = getRevokeSessionMutation(sessionId);
  await executeGraphQlQuery(mutation);
  ctx.client.setHeader('Authorization', `Bearer ${createResponse.createSession.token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  expect(sessionsResponse.errors[0].message).toBe('Session expired');
});

test('Auth session: cant revoke without auth', async () => {
  const name = 'JoJo';
  const mutation = getCreateSessionMutation(name, '*', 3600);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(createResponse.errors[0].message).toBe('Not authenticated');
});

test('Auth session: cant revoke twice', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const name = 'JoJo';
  let mutation = getCreateSessionMutation(name, '*', 3600);
  const createResponse = (await executeGraphQlQuery(mutation)) as any;
  const sessionId = createResponse?.createSession?.session.id;
  mutation = getRevokeSessionMutation(sessionId);
  await executeGraphQlQuery(mutation);
  const secondRevokeResponse = await executeGraphQlQuery(mutation) as any;
  expect(secondRevokeResponse.errors[0].message).toBe('Session already revoked');
});

test('Auth session: revoke sessions of other users', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  const sessionsResponse = (await executeGraphQlQuery(listSessionsQuery)) as any;
  const session = sessionsResponse?.sessions[0];
  const { token: secondUserToken } = (await executeGraphQlQuery(getSignUpMutation('scott', 'malcinson')) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${secondUserToken}`);
  const mutation = getRevokeSessionMutation(session.id);
  const revokeResponse = (await executeGraphQlQuery(mutation)) as any;
  expect(revokeResponse.errors[0].message).toBe('Failed to revoke session');
});

test('Auth session: origin restriction wrong origin', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  let mutation = getCreateSessionMutation('Origin', 'http://google.com', 3600);
  const sessionResponse = await executeGraphQlQuery(mutation) as any;
  const sessionToken = sessionResponse.createSession?.token;
  ctx.client.setHeader('Authorization', `Bearer ${sessionToken}`);
  ctx.client.setHeader('Origin', `http://localhost`);
  const meResponse = (await executeGraphQlQuery(meQuery)) as any;
  expect(meResponse.errors[0].message).toBe("Access denied due to origin restriction")
})

test('Auth session: origin restriction success', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  let mutation = getCreateSessionMutation('Origin', 'http://google.com', 3600);
  const sessionResponse = await executeGraphQlQuery(mutation) as any;
  const sessionToken = sessionResponse.createSession?.token;
  ctx.client.setHeader('Authorization', `Bearer ${sessionToken}`);
  ctx.client.setHeader('Origin', `http://google.com`);
  const meResponse = (await executeGraphQlQuery(meQuery)) as any;
  expect(meResponse.me.username).toBe(USERNAME)
})

test('Auth session: origin restriction missing header', async () => {
  const { token } = (await executeGraphQlQuery(getSignUpMutation()) as any).signUp;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  let mutation = getCreateSessionMutation('Origin', 'http://google.com', 3600);
  const sessionResponse = await executeGraphQlQuery(mutation) as any;
  const sessionToken = sessionResponse.createSession?.token;
  ctx.client.setHeader('Authorization', `Bearer ${sessionToken}`);
  const meResponse = (await executeGraphQlQuery(meQuery)) as any;
  expect(meResponse.errors[0].message).toBe("Origin header not found")
})
