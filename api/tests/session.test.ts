import { test, expect } from 'vitest';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { isRecent } from './helpers/time';
import { ctx } from './helpers/server';
import { signIn } from './auth.test';
import {
  system, createSession, revokeSession,
} from './helpers/gql';
import { PUBLIC_KEY, SECOND_PRIVATE_KEY } from './helpers/const';

cleanDatabaseBeforeAfterEachTest();

test('Auth session: list, no auth', async () => {
  await expect(
    () => system(),
  ).rejects.toThrowError('Not authenticated');
});

test('Auth session: list', async () => {
  await signIn();
  const sessionsResponse = (await system()).auth.sessions;
  const executedAt = new Date();
  expect(sessionsResponse.length).toBe(1);
  const session = sessionsResponse[0];
  expect(isRecent(new Date(session.createdAt), executedAt)).toBe(true);
  expect(session.isUserCreated).toBe(false);
});

test('Auth session: revoke', async () => {
  await signIn();
  const sessionsResponse = (await system()).auth.sessions;
  const session = sessionsResponse[0];
  const revokeResponse = await revokeSession(session.id);
  expect(revokeResponse?.id).toBe(session.id);
  const revokedDate = new Date(revokeResponse?.revokedAt);
  expect(isRecent(revokedDate, new Date())).toBe(true);
});

test('Auth session: revoke, no auth', async () => {
  await expect(
    () => revokeSession('funny'),
  ).rejects.toThrowError('Not authenticated');
});

test('Auth session: revoke nonexistent', async () => {
  await signIn();
  await expect(
    () => revokeSession('nonexistent'),
  ).rejects.toThrowError('Session not found');
});

test('Auth session: create expirable', async () => {
  await signIn();
  const createResponse = await createSession('Expirable', '*', 1);
  console.log(createResponse)
  expect(
    isRecent(new Date(createResponse.session.referenceExpiryDate)),
  ).toBe(true);
  await new Promise((resolve) => { setTimeout(resolve, 1500); });

  ctx.client.setHeader('Authorization', `Bearer ${createResponse.token}`);
  await expect(
    () => system(),
  ).rejects.toThrowError('Token expired');
});

test('Auth session: create unexpirable', async () => {
  await signIn();
  const name = 'Unexpirable';
  const createResponse = await createSession(name, '*', null);
  expect(createResponse.session.name).toBe(name);
  expect(
    createResponse.session.referenceExpiryDate,
  ).toBe(null);
  const sessionsResponse = (await system()).auth.sessions;
  expect(sessionsResponse.length).toBe(2);
  expect(sessionsResponse.some((s) => s.isUserCreated)).toBe(true);
  const customToken = createResponse.token;
  ctx.client.setHeader('Authorization', `Bearer ${customToken}`);
  const response = await system();
  expect(response.auth.me.address).toBe(PUBLIC_KEY);
});

test('Auth session: revoked session no longer works', async () => {
  await signIn();
  const createResponse = await createSession('Frobidden', '*', 3600);
  await revokeSession(createResponse.session.id);
  ctx.client.setHeader('Authorization', `Bearer ${createResponse.token}`);
  await expect(
    () => system(),
  ).rejects.toThrowError('Session expired');
});

test('Auth session: can not create without auth', async () => {
  await expect(
    () => createSession('Without auth', '*', 3600),
  ).rejects.toThrowError('Not authenticated');
});

test('Auth session: cant revoke twice', async () => {
  await signIn();
  const createResponse = await createSession('Twice revoked', '*', 3600);
  const sessionId = createResponse.session.id;
  await revokeSession(sessionId);
  await expect(
    () => revokeSession(sessionId),
  ).rejects.toThrowError('Session already revoked');
});

test('Auth session: revoke sessions of other users', async () => {
  const firstSignIn = await signIn();
  const secondSignIn = await signIn(SECOND_PRIVATE_KEY);
  ctx.client.setHeader('Authorization', `Bearer ${secondSignIn.token}`);
  await expect(
    () => revokeSession(firstSignIn.session.id),
  ).rejects.toThrowError('Session not found');
});

test('Auth session: origin restriction wrong origin', async () => {
  await signIn();
  const sessionResponse = await createSession('Wrong origin', 'http://google.com', 3600);
  ctx.client.setHeader('Authorization', `Bearer ${sessionResponse.token}`);
  await expect(
    () => system(),
  ).rejects.toThrowError('Access denied due to origin restriction');
});

test('Auth session: origin restriction success', async () => {
  await signIn();
  const sessionResponse = await createSession('Correct origin', 'http://google.com', 3600);
  ctx.client.setHeader('Authorization', `Bearer ${sessionResponse.token}`);
  ctx.client.setHeader('Origin', 'http://google.com');
  const response = await system();
  expect(response.auth.me.address).toBe(PUBLIC_KEY);
});

test('Auth session: origin restriction missing header', async () => {
  await signIn();
  const sessionResponse = await createSession('Missing origin', 'http://google.com', 3600);
  ctx.client.setHeader('Authorization', `Bearer ${sessionResponse.token}`);
  ctx.client.setHeader('Origin', '');
  await expect(
    () => system(),
  ).rejects.toThrowError('Origin not provided');
});

test('Auth session: origin valid - contains space', async () => {
  await signIn();
  const sessionResponse = await createSession('Spaced origin', 'http://google.com ', 3600);
  expect(sessionResponse.session.allowedOrigins).toBe('http://google.com');
});

test('Auth session: origin invalid - bad protocol', async () => {
  await signIn();
  await expect(
    () => createSession('Origin', 'htt://google.com', 3600),
  ).rejects.toThrowError("Origin must start with 'http://' or 'https://'");
});

test('Auth session: origin invalid - empty string', async () => {
  await signIn();
  await expect(
    () => createSession('Origin', '', 3600),
  ).rejects.toThrowError("Origin must start with 'http://' or 'https://'");
});
