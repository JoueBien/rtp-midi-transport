import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 88.71,
        functions: 86.6,
        branches: 82.07,
        statements: 88.72,
      },
    },
  },
});