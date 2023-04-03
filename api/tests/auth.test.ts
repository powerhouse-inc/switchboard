import { test, expect, vi } from 'vitest';
import ms from 'ms';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx } from './helpers/server';
import { restoreEnvAfterEach } from './helpers/env';
import * as env from '../src/env';
import {
  getSignUpMutation, signInMutation, meQuery, USERNAME,
} from './helpers/const';
import { isRecent } from './helpers/time';


cleanDatabaseBeforeAfterEachTest();
restoreEnvAfterEach();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const response = await ctx.client.mutation({
    signUp: {
      session: {
        id: true,
        isUserCreated: true
      },
      token: true,
      __args: {
        user: {
          username: 'adf',
          password: "adf"
        }
      }
    }
  })
  console.log(response)
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
