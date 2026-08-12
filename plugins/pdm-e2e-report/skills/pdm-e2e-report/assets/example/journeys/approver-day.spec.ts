import { APP_URL, expect, test } from "../fixtures/test";

test("承認者が申請を承認できる", async ({ pageAs }) => {
  const page = await pageAs("approver");
  await page.goto(APP_URL);
  await page.getByRole("button", { name: "承認する" }).click();
  await expect(page.getByText("承認しました")).toBeVisible();
});
