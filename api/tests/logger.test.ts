import { describe, expect, test, vi } from 'vitest';
import { getChildLogger } from '../src/logger';

describe('Logger: metadata', () => {
  test('Logger: creation, prefix and bindings', () => {
    const logger = getChildLogger({ msgPrefix: 'test' }, { purpose: 'test' });
    // value of bindings in the logger looks like `,"key":"value","key2":"value2"`
    expect(logger.bindings()).toEqual({
      module: 'tests/logger.test.ts',
      purpose: 'test'
    });
    const spy = vi.spyOn(logger, 'info');
    logger.info('test');
    expect(spy).toHaveBeenCalledWith('test');
  });
});

describe('Logger: filters', () => {
  vi.mock('../logger.config.ts', () => ({
    loggerConfig: {
      moduleFilter: ['tests/logger.test.ts'],
      prefixFilter: ['testPrefix'],
      logLevel: 'warn',
      dbLogLevel: ['warn'],
      httpLogLevel: 'debug'
    }
  }));

  test('Logger: logging filter with both filters', () => {
    const logger = getChildLogger({ msgPrefix: 'testPrefix' });
    expect(logger.level).toBe('warn');
  });

  test('Logger: logging filter with module filter', () => {
    const logger = getChildLogger(undefined, { module: 'testModule' });
    expect(logger.level).toBe('silent');
  });
});
