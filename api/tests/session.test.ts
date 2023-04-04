import { test, expect } from 'vitest';
import { signUp, getMe, USERNAME } from './helpers/requests';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { isRecent } from './helpers/time';
import { ctx } from './helpers/server';
import { setHeader } from './helpers/testContext';
import { GenqlError } from '../generated';

cleanDatabaseBeforeAfterEachTest();

const listSessionsQuery = async () => ctx.client.query({
  sessions: {
    id: true,
    name: true,
    createdAt: true,
    createdBy: true,
    referenceExpiryDate: true,
    revokedAt: true,
    referenceTokenId: true,
    isUserCreated: true,
  },
});

const revokeSession = async (sessionId: string) => ctx.client.mutation({
  revokeSession: {
    id: true,
    name: true,
    createdAt: true,
    createdBy: true,
    referenceExpiryDate: true,
    revokedAt: true,
    referenceTokenId: true,
    isUserCreated: true,
    __args: {
      sessionId,
    },
  },
});

const createSession = async (
  name: string,
  expiryDurationSeconds?: number | null,
) => ctx.client.mutation({
  createSession: {
    session: {
      id: true,
      name: true,
      createdAt: true,
      createdBy: true,
      referenceExpiryDate: true,
      revokedAt: true,
      referenceTokenId: true,
      isUserCreated: true,
    },
    token: true,
    __args: {
      session: {
        name,
        expiryDurationSeconds,
      },
    },
  },
});

test('Auth session: list', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const sessionsResponse = await listSessionsQuery();
  const executedAt = new Date();
  expect(sessionsResponse.sessions.length).toBe(1);
  const session = sessionsResponse.sessions[0];
  expect(isRecent(new Date(session.createdAt), executedAt)).toBe(true);
  expect(session.isUserCreated).toBe(false);
});

test('Auth session: list, no auth', async () => {
  const sessionsResponse: GenqlError = await listSessionsQuery().catch((e) => e);
  expect(sessionsResponse.errors[0].message).toBe('Not authenticated');
});

test('Auth session: revoke', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const sessionsResponse = await listSessionsQuery();
  const session = sessionsResponse.sessions[0];
  const revokeResponse = await revokeSession(session.id);
  expect(revokeResponse.revokeSession.id).toBe(session.id);
  const revokedDate = new Date(revokeResponse.revokeSession.revokedAt!);
  expect(isRecent(revokedDate, new Date())).toBe(true);
});

test('Auth session: revoke, no auth', async () => {
  const response: GenqlError = await revokeSession('funny').catch((e) => e);
  expect(response.errors[0].message).toBe('Not authenticated');
});

test('Auth session: revoke unexistant', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const revokeResponse = await revokeSession('asdf').catch((e) => e);
  expect(revokeResponse?.errors[0].message).toBe('Session not found');
  expect(revokeResponse?.errors[0].extensions.code).toBe('SESSION_NOT_FOUND');
});

test('Auth session: create expirable', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const name = 'JoJo';
  const expectedExpiryDate = new Date();
  const createResponse = await createSession(name, 1);
  expect(createResponse.createSession.session.name).toBe(name);
  expect(
    isRecent(new Date(
      createResponse.createSession.session.referenceExpiryDate!,
    ), expectedExpiryDate),
  ).toBe(true);
  const createdToken = createResponse?.createSession?.token;
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const sessionsResponse = await listSessionsQuery();
  expect(sessionsResponse.sessions.length).toBe(2);
  const userCreatedList: boolean[] = (
    sessionsResponse?.sessions.map((session: any) => session.isUserCreated)
  );
  expect(userCreatedList.some((i) => i)).toBe(true);
  setHeader({ Authorization: `Bearer ${createdToken}` });
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 20));
  const meResponse: GenqlError = await getMe(ctx.client).catch((e) => e);
  expect(meResponse.errors.length).toBe(1);
  expect(meResponse.errors[0].message).toBe('Token expired');
});

test('Auth session: create unexpirable', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const name = 'JoJo';
  const createResponse = await createSession(name, null);
  expect(createResponse.createSession.session.name).toBe(name);
  expect(
    createResponse.createSession.session.referenceExpiryDate,
  ).toBe(null);
  const sessionsResponse = await listSessionsQuery();
  expect(sessionsResponse.sessions.length).toBe(2);
  const userCreatedList: boolean[] = (
    sessionsResponse?.sessions.map((session: any) => session.isUserCreated)
  );
  expect(userCreatedList.some((i) => i)).toBe(true);
  const customToken = createResponse?.createSession?.token;
  setHeader({ Authorization: `Bearer ${customToken}` });
  const meResponse = await getMe(ctx.client);
  expect(meResponse.me.username).toBe(USERNAME);
});

test('Auth session: revoked session is forbidden', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const name = 'JoJo';
  const createResponse = await createSession(name, 3600);
  const sessionId = createResponse.createSession.session.id;
  await revokeSession(sessionId);
  setHeader({ Authorization: `Bearer ${createResponse.createSession.token}` });
  const sessionsResponse: GenqlError = await listSessionsQuery().catch((e) => e);
  expect(sessionsResponse.errors[0].message).toBe('Session expired');
});

test('Auth session: cant revoke without auth', async () => {
  const name = 'JoJo';
  const createResponse: GenqlError = await createSession(name, 3600).catch((e) => e);
  expect(createResponse.errors[0].message).toBe('Not authenticated');
});

test('Auth session: cant revoke twice', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const name = 'JoJo';
  const createResponse = await createSession(name, 3600);
  const sessionId = createResponse.createSession.session.id;
  await revokeSession(sessionId);
  const secondRevokeResponse: GenqlError = await revokeSession(sessionId).catch((e) => e);
  expect(secondRevokeResponse.errors[0].message).toBe('Session already revoked');
});

test('Auth session: revoke sessions of other users', async () => {
  const { signUp: response } = await signUp(ctx.client);
  setHeader({ Authorization: `Bearer ${response.token}` });
  const sessionsResponse = await listSessionsQuery();
  const session = sessionsResponse.sessions[0];
  const { signUp: responseSecond } = await signUp(ctx.client, 'scott', 'malcinson');
  setHeader({ Authorization: `Bearer ${responseSecond.token}` });
  const revokeResponse: GenqlError = await revokeSession(session.id).catch((e) => e);
  expect(revokeResponse.errors[0].message).toBe('Failed to revoke session');
});
