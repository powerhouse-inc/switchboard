import { defineConfig, UserConfigExport } from 'vitest/config';

export const getVitestConfig = (fullyCoveredModulePaths?: string[]): UserConfigExport => {
  const enableFullCoverage = !!fullyCoveredModulePaths && fullyCoveredModulePaths.length !== 0;
  const coverage = enableFullCoverage ? 100 : 90;
  return {
    test: {
      coverage: {
        enabled: true,
        provider: 'istanbul',
        lines: coverage,
        functions: coverage,
        statements: coverage,
        include: fullyCoveredModulePaths || undefined,
      },
      singleThread: true,
    },
  };
};

export default defineConfig(getVitestConfig());
