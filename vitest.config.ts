import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 88.47,
        functions: 86.11,
        branches: 82.01,
        statements: 88.49,
      },
    },
  },
});
