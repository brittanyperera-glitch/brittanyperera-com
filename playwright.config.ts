import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3100" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // iPhone 14 defaults to webkit; pin chromium so one browser install covers both projects.
    { name: "phone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
  ],
  webServer: {
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100/",
    reuseExistingServer: !process.env.CI,
  },
});
