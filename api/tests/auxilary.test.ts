import fetch from 'node-fetch';
import { describe, expect, test, vi } from 'vitest';
import prisma from '../src/__mocks__/database';
import { getJwtExpirationPeriod, getJwtSecret } from '../src/env/getters';
import { restoreEnvAfterEach } from './helpers/env';
import { ctx } from './helpers/server';

restoreEnvAfterEach();

test('Env: jwt expiration in ms format', async () => {
  process.env.JWT_EXPIRATION_PERIOD = '5d';
  expect(getJwtExpirationPeriod()).toBe('5d');
});

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
  process.env.JWT_EXPIRATION_PERIOD = 'lol';
  expect(getJwtExpirationPeriod).toThrowError(
    'JWT_EXPIRATION_PERIOD must be a number of seconds or ms string'
  );
});

test('Env: jwt expiration automatically set if not provided', async () => {
  process.env.JWT_EXPIRATION_PERIOD = '';
  expect(getJwtExpirationPeriod()).toBe('7d');
});

test('Env: jwt expiration in seconds format', async () => {
  process.env.JWT_EXPIRATION_PERIOD = '3600';
  expect(getJwtExpirationPeriod()).toBe('1h');
});

describe('Healthz', () => {
  vi.mock('../src/database');

  test('healthz: returns 200', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      address: '0x0',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const url = `${ctx.baseUrl}/healthz`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.status).toBe('healthy');
  });

  test('healthz: returns 500', async () => {
    prisma.user.findFirst.mockRejectedValueOnce(new Error('test'));
    const url = `${ctx.baseUrl}/healthz`;
    const res = await fetch(url);
    expect(res.status).toBe(500);
    const json: any = await res.json();
    expect(json.status).toBe(
      'Failed database initialization check with error: test'
    );
  });
});
