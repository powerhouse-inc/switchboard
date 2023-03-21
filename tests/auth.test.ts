import { test, expect } from 'vitest';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { getClient, runTestApiInstance } from './helpers/server';

// Define calls with errors caught via `.catch` since with `expect().rejects`
// vitest throws an "Unhandled Error"
const signUpMutation = () => getClient().mutation({
  signUp: {
    __args: {
      user: {
        username: 'asdf',
        password: 'asdf',
      },
    },
    token: true,
    user: { username: true, id: true },
  },
}).catch((e) => e);

const signInMutation = () => getClient().mutation({
  signIn: {
    __args: {
      user: {
        username: 'asdf',
        password: 'asdf',
      },
    },
    token: true,
    user: { username: true, id: true },
  },
}).catch((e) => e);

const signInIncorrectPasswordMutation = () => getClient().mutation({
  signIn: {
    __args: {
      user: {
        username: 'asdf',
        password: 'wrong',
      },
    },
    token: true,
    user: { username: true, id: true },
  },
}).catch((e) => e);

const meQuery = (headers: Record<string, string>) => getClient(headers).query({
  me: {
    username: true,
    id: true,
  },
}).catch((e) => e);

// Test fixtures (before, after invocations)
cleanDatabaseBeforeAfterEachTest();
runTestApiInstance();

test('Authentication: sign up, sign in, request protected enpoint', async () => {
  const signUpResponse = await signUpMutation();
  expect(signUpResponse?.signUp?.user?.username).toBe('asdf');
  expect(signUpResponse?.signUp?.token).toBeTruthy();

  const signInResponse = await signInMutation();
  expect(signInResponse?.signIn?.user?.username).toBe('asdf');
  expect(signInResponse?.signIn?.token).toBeTruthy();

  const token = signInResponse?.signIn?.token;
  const meResponse = await meQuery({ Authorization: `Bearer ${token}` });
  expect(meResponse?.me?.username).toBe('asdf');
  expect(meResponse?.me?.id).toBeTruthy();
});

test('Authentication: sign in without signing up', async () => {
  const unexistantUserResponse = await signInMutation();
  expect(unexistantUserResponse.errors[0].message).toBe('User not found');
});

test('Authentication: sign up with same username', async () => {
  await signUpMutation();
  const secondSignUpResponse = await signUpMutation();
  expect(secondSignUpResponse.errors[0].message).toBe('Username already taken');
});

test('Authentication: access protected endpoint without signing in', async () => {
  const meResponse = await meQuery({});
  expect(meResponse.errors[0].message).toBe('Not authenticated');
});

test('Authentication: sign up, sign in with wrong password', async () => {
  const signUpResponse = await signUpMutation();
  expect(signUpResponse?.signUp?.user?.username).toBe('asdf');
  expect(signUpResponse?.signUp?.token).toBeTruthy();
  const incorrectPasswordResponse = await signInIncorrectPasswordMutation();
  expect(incorrectPasswordResponse.errors[0].message).toBe('Invalid password');
});

test('Authentication: access protected endpoint without valid token', async () => {
  const invalidBearer = await meQuery({ Authorization: 'Bearer invalid' });
  expect(invalidBearer.errors[0].message).toBe('Invalid authentication token');
});
