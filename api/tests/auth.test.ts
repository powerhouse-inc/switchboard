import { test, expect } from 'vitest';
import builder from 'gql-query-builder';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { ctx, executeGraphQlQuery } from './helpers/server';

const signUpMutation = builder.mutation({
  operation: 'signUp',
  variables: {
    user: {
      value: {
        username: 'asdf',
        password: 'asdf',
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['user{id, username}', 'token'],
});

const singInMutation = builder.mutation({
  operation: 'signIn',
  variables: {
    user: {
      value: {
        username: 'asdf',
        password: 'asdf',
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['user{id, username}', 'token'],
});

const meQuery = builder.query({
  operation: 'me',
  fields: ['id', 'username'],
});

cleanDatabaseBeforeAfterEachTest();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = (await executeGraphQlQuery(signUpMutation)) as Record<
  string,
  any
  >;
  expect(signUpResponse?.signUp?.user?.username).toBe('asdf');
  expect(signUpResponse?.signUp?.token).toBeTruthy();

  const signInResponse = (await executeGraphQlQuery(singInMutation)) as Record<
  string,
  any
  >;
  expect(signInResponse?.signIn?.user?.username).toBe('asdf');
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
  const response = (await executeGraphQlQuery(singInMutation)) as any;
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
  const signUpResponse = (await executeGraphQlQuery(signUpMutation)) as Record<
  string,
  any
  >;
  expect(signUpResponse?.signUp?.user?.username).toBe('asdf');
  expect(signUpResponse?.signUp?.token).toBeTruthy();

  const singInIncorrectPassword = {
    variables: {
      user: {
        username: 'asdf',
        password: 'wrong',
      },
    },
    query: singInMutation.query,
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
