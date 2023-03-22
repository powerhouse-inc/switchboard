import { test, expect } from 'vitest';
import { getJwtSecret } from '../src/env';
import { restoreEnvAfterEach } from './helpers/env';

restoreEnvAfterEach();

test('Env: production has jwt secret defined', async () => {
  process.env.JWT_SECRET = '';
  process.env.NODE_ENV = 'production';
  expect(getJwtSecret).toThrowError('JWT_SECRET is not defined');
});
