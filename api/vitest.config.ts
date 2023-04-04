import { defineConfig, UserConfig, coverageConfigDefaults } from 'vitest/config';

export const defaultConfig: UserConfig = {
  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
      lines: 90,
      functions: 90,
      statements: 90,
      exclude: [...coverageConfigDefaults.exclude, '**/codegen/**', '**/generated/**'],
    },
    singleThread: true,
  },
};

export default defineConfig(defaultConfig);
