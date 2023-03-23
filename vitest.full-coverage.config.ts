import { defineConfig } from 'vitest/config';
import { getVitestConfig } from './vitest.config';

const fullyCoveredModules = [
  'src/modules/**',
];

export default defineConfig(getVitestConfig(fullyCoveredModules));
