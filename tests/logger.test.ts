import {
  test, expect, vi, describe,
} from 'vitest';
import { getChildLogger } from '../src/logger';

function getValueBySymbolKey(obj: any, symbolStr: string) {
  const key = Object.getOwnPropertySymbols(obj).filter(
    (symbol) => symbol.toString() === symbolStr,
  )[0];
  return obj[key];
}

describe('Logger: metadata', () => {
  test('Logger: creation, prefix and bindings', () => {
    const logger = getChildLogger({ msgPrefix: 'test' }, { purpose: 'test' });
    const msgPrefix: string = getValueBySymbolKey(
      logger,
      'Symbol(pino.msgPrefix)',
    );
    const bindings: string = getValueBySymbolKey(
      logger,
      'Symbol(pino.chindings)',
    );
    // value of bindings in the logger looks like `,"key":"value","key2":"value2"`
    const bindingObject = JSON.parse(`{${bindings.slice(1)}}`);
    expect(msgPrefix).toBe('[TEST] ');
    expect(bindingObject.purpose).toBe('test');
  });
});

describe('Logger: filters', () => {
  vi.mock('../logger.config.ts', () => ({
    loggerConfig: {
      moduleFilter: ['tests/logger.test.ts'],
      prefixFilter: ['testPrefix'],
      logLevel: 'warn',
      dbLogLevel: ['warn'],
      httpLogLevel: 'debug',
    },
  }));

  test('Logger: logging filter with both filters', () => {
    const logger = getChildLogger({ msgPrefix: 'testPrefix' });
    const level = getValueBySymbolKey(logger, 'Symbol(pino.levelVal)');
    expect(level).toBe(40);
  });

  test('Logger: logging filter with module filter', () => {
    const logger = getChildLogger(undefined, { module: 'testModule' });
    const level = getValueBySymbolKey(logger, 'Symbol(pino.levelVal)');
    expect(level).toBe(Infinity);
  });
});
