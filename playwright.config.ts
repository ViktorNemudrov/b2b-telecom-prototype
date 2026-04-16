import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  outputDir: "test-results/blob",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    {
      name: "mobile-android-chrome",
      use: {
        ...devices["Pixel 7"]
      }
    },
    {
      name: "mobile-ios-safari",
      use: {
        ...devices["iPhone 13"]
      }
    }
  ],
  webServer: [
    {
      command: "npm run dev:ai",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "npm run dev:classic",
      port: 3001,
      reuseExistingServer: true,
      timeout: 120_000
    }
  ]
});
