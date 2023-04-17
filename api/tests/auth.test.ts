import { test, expect, vi } from 'vitest';
import ms from 'ms';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx, executeGraphQlQuery } from './helpers/server';
import { restoreEnvAfterEach } from './helpers/env';
import * as env from '../src/env';
import {
  getSignUpMutation, signInMutation, meQuery, USERNAME,
} from './helpers/const';
import { isRecent } from './helpers/time';

cleanDatabaseBeforeAfterEachTest();
restoreEnvAfterEach();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = (await executeGraphQlQuery(getSignUpMutation())) as Record<
  string,
  any
  >;
  const tokenExpiry = new Date(new Date().getTime() + ms(env.JWT_EXPIRATION_PERIOD));
  expect(
    isRecent(new Date(signUpResponse?.signUp?.session?.referenceExpiryDate), tokenExpiry),
  )
    .toBe(true);
  expect(signUpResponse?.signUp?.token).toBeTruthy();
  expect(signUpResponse?.signUp?.session?.isUserCreated).toBe(false);

  const signInResponse = (await executeGraphQlQuery(signInMutation)) as Record<
  string,
  any
  >;
  expect(
    isRecent(new Date(signInResponse?.signIn?.session?.referenceExpiryDate), tokenExpiry),
  )
    .toBe(true);
  expect(signInResponse?.signIn?.token).toBeTruthy();
  expect(signInResponse?.signIn?.session?.isUserCreated).toBe(false);

  const token = signInResponse?.signIn?.token;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);
  ctx.client.setHeader('Origin', 'http://localhost');

  const meResponse = (await executeGraphQlQuery(meQuery)) as Record<
  string,
  any
  >;
  expect(meResponse?.me?.username).toBe(USERNAME);
  expect(meResponse?.me?.id).toBeTruthy();
});

test('Authentication: sign in without signing up', async () => {
  const response = (await executeGraphQlQuery(signInMutation)) as any;
  expect(response.errors[0].message).toBe('User not found');
});

test('Authentication: sign up with same username', async () => {
  const signUpMutation = getSignUpMutation();
  await executeGraphQlQuery(signUpMutation);
  const response = (await executeGraphQlQuery(signUpMutation)) as any;
  expect(response.errors[0].message).toBe('Username already taken');
});

test('Authentication: access protected endpoint without signing in', async () => {
  const response = (await executeGraphQlQuery(meQuery)) as any;
  expect(response.errors[0].message).toBe('Not authenticated');
});

test('Authentication: sign up, sign in with wrong password', async () => {
  await executeGraphQlQuery(getSignUpMutation());

  const singInIncorrectPassword = {
    variables: {
      user: {
        username: USERNAME,
        password: 'wrong',
      },
    },
    query: signInMutation.query,
  };
  const signInResponse = (await executeGraphQlQuery(
    singInIncorrectPassword,
  )) as Record<string, any>;
  expect(signInResponse?.errors[0].message).toBe('Invalid password');
});

test('Authentication: access protected endpoint without valid token', async () => {
  ctx.client.setHeader('Authorization', 'Bearer heavy');
  const response = (await executeGraphQlQuery(meQuery)) as any;
  expect(response.errors[0].message).toBe('Invalid authentication token');
});

test('Authentication: token expiration error', async () => {
  await executeGraphQlQuery(getSignUpMutation());

  vi.spyOn(env, 'JWT_EXPIRATION_PERIOD', 'get').mockReturnValue('1s');
  const signInResponse = (await executeGraphQlQuery(signInMutation)) as Record<
  string,
  any
  >;
  expect(signInResponse?.signIn?.token).toBeTruthy();
  const expiry = new Date(signInResponse?.signIn?.session?.referenceExpiryDate).getTime();
  const now = new Date().getTime();

  const token = signInResponse?.signIn?.token;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);

  // wait until token expires
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, expiry - now));
  const meResponse = (await executeGraphQlQuery(meQuery)) as Record<
  string,
  any
  >;
  expect(meResponse?.errors[0].message).toBe('Token expired');
});

test('Authentication: sign up disabled', async () => {
  vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
  const response = (await executeGraphQlQuery(getSignUpMutation())) as any;
  expect(response.errors[0].message).toBe('Sign up is disabled');
});
