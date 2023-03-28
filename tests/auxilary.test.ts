import { test, expect } from 'vitest';
import { getJwtSecret, getJwtExpirationPeriod } from '../src/env/getters';
import { restoreEnvAfterEach } from './helpers/env';

restoreEnvAfterEach();

test('Env: production has jwt secret defined', async () => {
  process.env.JWT_SECRET = '';
  process.env.NODE_ENV = 'production';
  expect(getJwtSecret).toThrowError('JWT_SECRET is not defined');
});

test('Env: dev environment has jwt secret automatically set', async () => {
  process.env.JWT_SECRET = '';
  expect(getJwtSecret()).toBe('dev');
});

test('Env: jwt expiration automatically throws if invalid', async () => {
  process.env.JWT_EXPIRATION_PERIOD_SECONDS = 'lol';
  expect(getJwtExpirationPeriod).toThrowError('JWT_EXPIRATION_PERIOD_SECONDS must be a number');
});

test('Env: jwt expiration automatically set if not provided', async () => {
  process.env.JWT_EXPIRATION_PERIOD_SECONDS = '';
  expect(getJwtExpirationPeriod()).toBe('7d');
});
