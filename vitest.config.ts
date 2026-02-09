import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/main/**/__tests__/**/*.spec.ts"],
  },
});
