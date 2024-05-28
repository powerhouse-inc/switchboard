/* eslint-disable import/no-extraneous-dependencies */
import esbuild from 'esbuild';
import { builtinModules } from 'module';
import pkg from './package.json' with { type: 'json' };

// Configuration options
const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  sourcemap: true,
  target: 'node20',
  loader: {
    '.node': 'copy',
  },
  external: [
    ...builtinModules, // Exclude Node.js built-in modules
    // Exclude all node_modules except specific-module
    ...Object.keys(pkg.dependencies).filter((dep) => dep !== 'document-drive'),
    ...Object.keys(pkg.devDependencies),
  ],
  logLevel: 'info',
};

// Build process
esbuild.build(config).catch(() => process.exit(1));
