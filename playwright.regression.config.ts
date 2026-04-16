import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/regression",
  testMatch: "**/*.pw.ts",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev:ai",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
