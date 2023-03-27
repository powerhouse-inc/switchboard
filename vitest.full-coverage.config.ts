import { defineConfig } from 'vitest/config';
import { getVitestConfig } from './vitest.config';

const fullyCoveredModulePaths = [
  'src/modules/**',
];

export default defineConfig(getVitestConfig(fullyCoveredModulePaths));
