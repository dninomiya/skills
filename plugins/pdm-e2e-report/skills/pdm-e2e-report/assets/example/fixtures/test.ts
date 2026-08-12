import path from "node:path";
import { test as base, type Page } from "@playwright/test";
import { STORAGE_STATE, steps } from "./steps";

type RoleKey = keyof typeof STORAGE_STATE;

export const APP_URL = `file://${path.join(__dirname, "../app/index.html")}`;

export const test = base.extend<{
  autoSteps: void;
  pageAs: (role: RoleKey) => Promise<Page>;
}>({
  autoSteps: [
    async ({ browser }, use, testInfo) => {
      await steps.install(browser);
      steps.setCurrentTest(testInfo);
      await use();
      steps.setCurrentTest(null);
    },
    { auto: true },
  ],
  pageAs: async ({ browser }, use) => {
    const pages: Page[] = [];
    await use(async (role) => {
      const context = await browser.newContext({
        storageState: STORAGE_STATE[role],
      });
      const page = await context.newPage();
      pages.push(page);
      return page;
    });
    for (const page of pages) {
      await page.context().close();
    }
  },
});

export { expect } from "@playwright/test";
