import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      lines: 100,
      functions: 100,
      statements: 100,
      include: [
        'src/modules/**',
      ]
    },
    singleThread: true,
  },
});
