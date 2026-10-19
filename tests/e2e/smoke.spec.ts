import { expect, test } from "@playwright/test";

test("home page responds and renders the desktop shell", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("button", { name: "Special" })).toBeVisible();
  await expect(page.getByRole("button", { name: "About me" })).toBeVisible();
});

test.describe("before any JavaScript runs", () => {
  test.use({ javaScriptEnabled: false });

  test("the desktop background is already painted (no white flash)", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(107, 124, 153)");
  });
});
