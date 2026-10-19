import { expect, test } from "@playwright/test";
import { meta } from "../../src/content/meta";

test("home page responds and renders the desktop shell", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("button", { name: "Special" })).toBeVisible();
  await expect(page.getByRole("button", { name: "About me" })).toBeVisible();
});

test("the desktop page has one main landmark and one h1 carrying the site title", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(meta.title);
  await expect(page.locator("main h1")).toHaveCount(1);
});

test.describe("before any JavaScript runs", () => {
  test.use({ javaScriptEnabled: false });

  test("the desktop background is already painted (no white flash)", async ({ page }) => {
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(107, 124, 153)");
  });
});
