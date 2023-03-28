import { test, expect, vi } from 'vitest';
import builder from 'gql-query-builder';
import ms from 'ms';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx, executeGraphQlQuery } from './helpers/server';
import { restoreEnvAfterEach } from './helpers/env';
import * as env from '../src/env';
import { signUpMutation, signInMutation } from './helpers/const';
import { isRecent } from './helpers/time';

const meQuery = builder.query({
  operation: 'me',
  fields: ['id', 'username'],
});

cleanDatabaseBeforeAfterEachTest();
restoreEnvAfterEach();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = (await executeGraphQlQuery(signUpMutation)) as Record<
  string,
  any
  >;
  const tokenExpiry = new Date(new Date().getTime() + ms(env.JWT_EXPIRATION_PERIOD));
  expect(
    isRecent(new Date(signUpResponse?.signUp?.session?.referenceExpiryDate), tokenExpiry),
  )
    .toBe(true);
  expect(signUpResponse?.signUp?.token).toBeTruthy();

  const signInResponse = (await executeGraphQlQuery(signInMutation)) as Record<
  string,
  any
  >;
  expect(
    isRecent(new Date(signInResponse?.signIn?.session?.referenceExpiryDate), tokenExpiry),
  )
    .toBe(true);
  expect(signInResponse?.signIn?.token).toBeTruthy();

  const token = signInResponse?.signIn?.token;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);

  const meResponse = (await executeGraphQlQuery(meQuery)) as Record<
  string,
  any
  >;
  expect(meResponse?.me?.username).toBe('asdf');
  expect(meResponse?.me?.id).toBeTruthy();
});

test('Authentication: sign in without signing up', async () => {
  const response = (await executeGraphQlQuery(signInMutation)) as any;
  expect(response.errors[0].message).toBe('User not found');
});

test('Authentication: sign up with same username', async () => {
  await executeGraphQlQuery(signUpMutation);
  const response = (await executeGraphQlQuery(signUpMutation)) as any;
  expect(response.errors[0].message).toBe('Username already taken');
});

test('Authentication: access protected endpoint without signing in', async () => {
  const response = (await executeGraphQlQuery(meQuery)) as any;
  expect(response.errors[0].message).toBe('Not authenticated');
});

test('Authentication: sign up, sign in with wrong password', async () => {
  await executeGraphQlQuery(signUpMutation);

  const singInIncorrectPassword = {
    variables: {
      user: {
        username: 'asdf',
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
  vi.spyOn(env, 'JWT_EXPIRATION_PERIOD', 'get').mockReturnValue('1ms');
  await executeGraphQlQuery(signUpMutation);

  const signInResponse = (await executeGraphQlQuery(signInMutation)) as Record<
  string,
  any
  >;
  expect(signInResponse?.signIn?.token).toBeTruthy();

  const token = signInResponse?.signIn?.token;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);

  const meResponse = (await executeGraphQlQuery(meQuery)) as Record<
  string,
  any
  >;
  // wait until token expires
  await new Promise((resolve) => { setTimeout(resolve, 20); resolve(null); });
  expect(meResponse?.errors[0].message).toBe('Token expired');
});

test('Authentication: sign up disabled', async () => {
  vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
  const response = (await executeGraphQlQuery(signUpMutation)) as any;
  expect(response.errors[0].message).toBe('Sign up is disabled');
});
