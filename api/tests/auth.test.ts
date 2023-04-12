import {
  test, expect, vi, afterEach,
} from 'vitest';
import ms from 'ms';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx } from './helpers/server';
import { setHeader } from './helpers/testContext';
import { restoreEnvAfterEach } from './helpers/env';
import * as env from '../src/env';
import {
  getMe,
  signIn,
  signUp,
  USERNAME,
} from './helpers/requests';
import { GenqlError } from '../generated';
import { isRecent } from './helpers/time';

cleanDatabaseBeforeAfterEachTest();
restoreEnvAfterEach();

afterEach(() => {
  vi.resetAllMocks();
});

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = await signUp(ctx.client);
  const tokenExpiry = new Date(new Date().getTime() + ms(env.JWT_EXPIRATION_PERIOD));
  expect(signUpResponse.signUp.session.referenceExpiryDate).not.toBeUndefined();
  expect(
    isRecent(new Date(signUpResponse.signUp.session.referenceExpiryDate!), tokenExpiry),
  )
    .toBe(true);
  expect(signUpResponse.signUp.token).toBeTruthy();
  expect(signUpResponse.signUp.session.isUserCreated).toBe(false);

  const signInResponse = await signIn(ctx.client);
  expect(
    isRecent(new Date(signInResponse.signIn.session.referenceExpiryDate!), tokenExpiry),
  )
    .toBe(true);
  expect(signInResponse?.signIn?.token).toBeTruthy();
  expect(signInResponse?.signIn?.session?.isUserCreated).toBe(false);

  const token = signInResponse?.signIn?.token;
  setHeader({ Authorization: `Bearer ${token}` });

  const meResponse = await getMe(ctx.client);
  expect(meResponse.me.username).toBe(USERNAME);
  expect(meResponse.me.id).toBeTruthy();
});

test('Authentication: sign in without signing up', async () => {
  const response: GenqlError = await signIn(ctx.client).catch((e) => e);
  expect(response.errors[0].message).toBe('User not found');
});

test('Authentication: sign up with same username', async () => {
  await signUp(ctx.client);
  const response: GenqlError = await signUp(ctx.client).catch((e) => e);
  expect(response.errors[0].message).toBe('Username already taken');
});

test('Authentication: access protected endpoint without signing in', async () => {
  const response: GenqlError = await getMe(ctx.client).catch((e) => e);
  expect(response.errors[0].message).toBe('Not authenticated');
});

test('Authentication: sign up, sign in with wrong password', async () => {
  await signUp(ctx.client);

  const signInResponse: GenqlError = await signIn(ctx.client, USERNAME, 'wrong').catch((e) => e);
  expect(signInResponse.errors[0].message).toBe('Invalid password');
});

test('Authentication: access protected endpoint without valid token', async () => {
  setHeader({ Authorization: 'Bearer heavy' });
  const response = await getMe(ctx.client).catch((e) => e);
  expect(response.errors[0].message).toBe('Invalid authentication token');
});

test('Authentication: token expiration error', async () => {
  await signUp(ctx.client);
  const signInResponse = await signIn(ctx.client);
  expect(signInResponse.signIn.token).toBeTruthy();
  setHeader({ Authorization: `Bearer ${signInResponse.signIn.token}` });
  const createdFastExpiredSession = await ctx.client.mutation({
    createSession: {
      token: true,
      session: {
        isUserCreated: true,
        id: true,
        referenceExpiryDate: true,
      },
      __args: {
        session: {
          expiryDurationSeconds: 1,
          name: 'test',
        },
      },
    },
  });
  const { token } = createdFastExpiredSession.createSession;
  setHeader({ Authorization: `Bearer ${token}` });

  // wait until token expires
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const meResponse: GenqlError = (await getMe(ctx.client).catch((e) => e));
  expect(meResponse.errors[0].message).toBe('Token expired');
});

test('Authentication: sign up disabled', async () => {
  vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
  const response: GenqlError = await signUp(ctx.client).catch((e) => e);
  expect(response.errors[0].message).toBe('Sign up is disabled');
});
