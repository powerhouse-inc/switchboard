import { defineConfig, UserConfigExport } from 'vitest/config';

export const getVitestConfig = (modulesWithFullCoverage?: string[]): UserConfigExport => {
  const coverage = !!modulesWithFullCoverage && modulesWithFullCoverage.length !== 0 ? 100 : 90;
  return {
    test: {
      coverage: {
        provider: 'istanbul',
        lines: coverage,
        functions: coverage,
        statements: coverage,
        include: modulesWithFullCoverage || undefined,
      },
      singleThread: true,
    },
  };
};

export default defineConfig(getVitestConfig());
