import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  workers: 1,
  reporter: [["list"], ["./reporters/index.ts"]],
  use: { screenshot: "only-on-failure" },
  projects: [{ name: "journeys", testDir: "./journeys" }],
});
