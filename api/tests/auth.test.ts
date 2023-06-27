import { test, expect, describe } from 'vitest';
import { restoreEnvAfterEach } from './helpers/env';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { createChallenge, solveChallenge, me } from './helpers/gql';
import { PUBLIC_KEY, signer } from './helpers/const';
import { ctx } from './helpers/server';
// import * as env from '../src/env';
// import ms from 'ms';
// import { isRecent } from './helpers/time';

export const signIn = async () => {
  const challengeResponse = await createChallenge(PUBLIC_KEY);
  const signature = await signer.signMessage(challengeResponse.message);
  const response = await solveChallenge(challengeResponse.nonce, signature);
  ctx.client.setHeader('Authorization', `Bearer ${response.token}`);
  ctx.client.setHeader('Origin', ctx.baseUrl);
  return response;
};

describe('Authentication', () => {
  cleanDatabaseBeforeAfterEachTest();
  restoreEnvAfterEach();

  test('Challange can be created correctly', async () => {
    const challengeResponse = await createChallenge(PUBLIC_KEY);
    expect(challengeResponse.message).not.toBeNull();
    expect(challengeResponse.nonce).not.toBeNull();
  });

  test('Challange creation fails if address is invalid', async () => {
    expect(
      () => createChallenge('0x123'),
    ).rejects.toThrowError('invalid address');
  });

  test('Challange can not use random nonce', async () => {
    expect(
      () => solveChallenge('nonce', 'signature'),
    ).rejects.toThrowError('The nonce is not known');
  });

  test('Challange can be solved incorrectly', async () => {
    const challengeResponse = (await createChallenge(PUBLIC_KEY));
    expect(
      () => solveChallenge(challengeResponse.nonce, 'signature'),
    ).rejects.toThrowError('Invalid signature');
  });

  test('The signature can not be used twice', async () => {
    const challengeResponse = await createChallenge(PUBLIC_KEY);
    const signature = await signer.signMessage(challengeResponse.message);
    await solveChallenge(challengeResponse.nonce, signature);
    expect(
      () => solveChallenge(challengeResponse.nonce, signature),
    ).rejects.toThrowError('The signature was already used');
  });

  // test('Sign up throws error if disabled', async () => {
  //   vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
  //   expect(
  //     () => signIn(),
  //   ).rejects.toThrowError('Sign up is disabled');
  // });

  test('Sign up works', async () => {
    const response = await signIn();
    expect(response?.token).toBeTruthy();
    expect(response?.session?.isUserCreated).toBe(false);
  });

  test('Protected endpoint fails without sign in', async () => {
    ctx.client.setHeader('Authorization', 'Bearer heavy');
    expect(
      () => me(),
    ).rejects.toThrowError('Invalid authentication token');
  });

  test('Protected endpoint works with sign in', async () => {
  });

  test('Error is thrown if token is expired', async () => {
  });
});

// test('Authentication: sign in without signing up', async () => {
//   const response = (await signInMutation)) as any;
//   expect(response.errors[0].message).toBe('User not found');
// });

// test('Authentication: sign up with same username', async () => {
//   const signUpMutation = getSignUpMutation();
//   await signUpMutation);
//   const response = (await signUpMutation)) as any;
//   expect(response.errors[0].message).toBe('Username already taken');
// });

// test('Authentication: access protected endpoint without signing in', async () => {
//   const response = (await meQuery()) as any;
//   expect(response.errors[0].message).toBe('Not authenticated');
// });

// test('Authentication: sign up, sign in with wrong password', async () => {
//   await getSignUpMutation());

//   const singInIncorrectPassword = {
//     variables: {
//       user: {
//         username: USERNAME,
//         password: 'wrong',
//       },
//     },
//     query: signInMutation.query,
//   };
//   const signInResponse = (await
//     singInIncorrectPassword,
//   )) as Record<string, any>;
//   expect(signInResponse?.errors[0].message).toBe('Invalid password');
// });

// test('Authentication: access protected endpoint without valid token', async () => {
//   ctx.client.setHeader('Authorization', 'Bearer heavy');
//   const response = (await meQuery()) as any;
//   expect(response.errors[0].message).toBe('Invalid authentication token');
// });

// test('Authentication: token expiration error', async () => {
//   await getSignUpMutation());

//   vi.spyOn(env, 'JWT_EXPIRATION_PERIOD', 'get').mockReturnValue('1s');
//   const signInResponse = (await signInMutation)) as Record<
//   string,
//   any
//   >;
//   expect(signInResponse?.signIn?.token).toBeTruthy();
//   const expiry = new Date(signInResponse?.signIn?.session?.referenceExpiryDate).getTime();
//   const now = new Date().getTime();

//   const token = signInResponse?.signIn?.token;
//   ctx.client.setHeader('Authorization', `Bearer ${token}`);

//   // wait until token expires
//   // eslint-disable-next-line no-promise-executor-return
//   await new Promise((resolve) => setTimeout(resolve, expiry - now));
//   const meResponse = (await meQuery()) as Record<
//   string,
//   any
//   >;
//   expect(meResponse?.errors[0].message).toBe('Token expired');
// });

// test('Authentication: sign up disabled', async () => {
//   vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
//   const response = (await getSignUpMutation())) as any;
//   expect(response.errors[0].message).toBe('Sign up is disabled');
// });
