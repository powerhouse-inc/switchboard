import { afterEach } from 'vitest';

const originalEnv = { ...process.env };
export function restoreEnvAfterEach() {
  afterEach(() => {
    process.env = { ...originalEnv };
  });
}
