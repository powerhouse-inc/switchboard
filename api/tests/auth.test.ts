import {
  vi, test, expect, describe,
} from 'vitest';
import { utils, Wallet } from 'ethers';
import { restoreEnvAfterEach } from './helpers/env';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { createChallenge, solveChallenge, system } from './helpers/gql';
import {
  PRIVATE_KEY, PUBLIC_KEY, signer, provider,
} from './helpers/const';
import { ctx } from './helpers/server';
import * as env from '../src/env';

export const signIn = async (privateKey = PRIVATE_KEY) => {
  const publicKey = utils.computeAddress(privateKey);
  const challengeResponse = await createChallenge(publicKey);
  const localSigner = new Wallet(privateKey, provider);
  const signature = await localSigner.signMessage(challengeResponse.message);
  const response = await solveChallenge(challengeResponse.nonce, signature);
  ctx.client.setHeader('Authorization', `Bearer ${response.token}`);
  return response;
};

describe('Authentication', () => {
  cleanDatabaseBeforeAfterEachTest();
  restoreEnvAfterEach();

  test('Challenge can be created correctly', async () => {
    const challengeResponse = await createChallenge(PUBLIC_KEY);
    expect(challengeResponse.message).not.toBeNull();
    expect(challengeResponse.nonce).not.toBeNull();
  });

  test('Challenge creation fails if address is invalid', async () => {
    await expect(
      () => createChallenge('0x123'),
    ).rejects.toThrowError('invalid address');
  });

  test('Challenge can not use random nonce', async () => {
    await expect(
      () => solveChallenge('nonce', 'signature'),
    ).rejects.toThrowError('The nonce is not known');
  });

  test('Challenge can be solved incorrectly', async () => {
    const challengeResponse = (await createChallenge(PUBLIC_KEY));
    await expect(
      () => solveChallenge(challengeResponse.nonce, '0x12345'),
    ).rejects.toThrowError('Signature validation has failed');
  });

  test('The signature can not be used twice', async () => {
    const challengeResponse = await createChallenge(PUBLIC_KEY);
    const signature = await signer.signMessage(challengeResponse.message);
    await solveChallenge(challengeResponse.nonce, signature);
    await expect(
      () => solveChallenge(challengeResponse.nonce, signature),
    ).rejects.toThrowError('The signature was already used');
  });

  test('Sign up throws error if disabled', async () => {
    vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(false);
    await expect(
      () => signIn(),
    ).rejects.toThrowError('Sign up is disabled');
    vi.spyOn(env, 'AUTH_SIGNUP_ENABLED', 'get').mockReturnValue(true);
  });

  test('Sign up works', async () => {
    const response = await signIn();
    expect(response?.token).toBeTruthy();
    expect(response?.session?.isUserCreated).toBe(false);
  });

  test('Protected endpoint fails without sign in', async () => {
    ctx.client.setHeader('Authorization', 'Bearer heavy');
    await expect(
      () => system(),
    ).rejects.toThrowError('Invalid authentication token');
  });

  test('Protected endpoint works with sign in', async () => {
    await signIn();
    const response = await system();
    expect(response.auth.me.address).not.toBeNull();
  });

  test('Error is thrown if token is expired', async () => {
    vi.spyOn(env, 'JWT_EXPIRATION_PERIOD', 'get').mockReturnValue('1s');
    const response = await signIn();
    expect(response.token).not.toBeNull();
    await new Promise((resolve) => { setTimeout(resolve, 2000); });
    await expect(
      () => system(),
    ).rejects.toThrowError('Token expired');
  });
});
