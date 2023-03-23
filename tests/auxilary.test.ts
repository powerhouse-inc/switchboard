import { test, expect } from 'vitest';
import { getJwtSecret } from '../src/env/getters';
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
