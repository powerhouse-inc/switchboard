import { defineConfig, UserConfig } from 'vitest/config';

export const defaultConfig: UserConfig = {
  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
      lines: 90,
      functions: 90,
      statements: 90,
    },
    singleThread: true,
  },
};

export default defineConfig(defaultConfig);
