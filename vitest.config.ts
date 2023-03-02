import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      lines: 0,
      functions: 0,
      statements: 0,
      all: true,
    },
  },
});
