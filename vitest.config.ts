import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      lines: 80,
      functions: 80,
      statements: 80,
    },
  },
});

