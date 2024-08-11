import { defineConfig } from 'vitest/config';
import { defaultConfig } from './vitest.config';

const modulesConfig = {
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    coverage: {
      ...defaultConfig.test?.coverage,
      lines: 100,
      functions: 100,
      statements: 100,
      include: ['src/modules/**']
    }
  }
};

export default defineConfig(modulesConfig);
