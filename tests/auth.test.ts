import { test, expect } from 'vitest';
import { gql } from 'graphql-request';
import { cleanDatabase } from './helpers/database';
import { ctx, executeGraphQlQuery } from './helpers/server';

const signUpMutation = gql`
  mutation {
    signUp(user: { username: "asdf", password: "asdf" }) {
      user {
        username
      }
      token
    }
  }`;
const signInMutation = gql`
  mutation {
    signIn(user: { username: "asdf", password: "asdf" }) {
      token
      user {
        username
      }
    }
  }`;
const meQuery = gql`
  query {
    me {
      username
      id
    }
  }`;

cleanDatabase();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = (await executeGraphQlQuery(signUpMutation)) as Record<string, any>;
  expect(signUpResponse?.signUp?.user?.username).toBe('asdf');
  expect(signUpResponse?.signUp?.token).toBeTruthy();

  const signInResponse = (await executeGraphQlQuery(signInMutation)) as Record<string, any>;
  expect(signInResponse?.signIn?.user?.username).toBe('asdf');
  expect(signInResponse?.signIn?.token).toBeTruthy();

  const token = signInResponse?.signIn?.token;
  ctx.client.setHeader('Authorization', `Bearer ${token}`);

  const meResponse = (await executeGraphQlQuery(meQuery)) as Record<string, any>;
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
  expect(response.errors[0].message).toBe('Failed to create user');
});

test('Authentication: access protected endpoint without signing in', async () => {
  const response = await executeGraphQlQuery(meQuery) as any;
  expect(response.errors[0].message).toBe('Not authenticated');
});
