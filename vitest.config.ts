import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      lines: 80,
      functions: 80,
      statements: 80,
    },
  },
});

