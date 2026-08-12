import { APP_URL, expect, test } from "../fixtures/test";

test("申請者が金額を入力して経費を申請できる", async ({ pageAs }) => {
  const page = await pageAs("applicant");
  await page.goto(APP_URL);
  await page.getByLabel("金額").fill("1200");
  await page.getByRole("button", { name: "申請する" }).click();
  await expect(page.getByText("申請しました: 1200")).toBeVisible();
});
