// frontend/vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
});
