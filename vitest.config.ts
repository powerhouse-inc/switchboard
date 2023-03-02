import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      lines: 90,
      functions: 90,
      statements: 90,
    },
  },
});

