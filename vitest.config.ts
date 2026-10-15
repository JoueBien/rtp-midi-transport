import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 87.29,
        functions: 86.36,
        branches: 80.31,
        statements: 87.31,
      },
    },
  },
});