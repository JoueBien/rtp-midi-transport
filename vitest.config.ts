import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/src/**.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 71,
      },
    },
  },
});
