import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/ai-kit/src/**/*.test.ts"],
    environment: "node",
    reporters: ["default"]
  }
});
