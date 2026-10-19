import { expect, test } from "@playwright/test";

test("cv page content and print styling", async ({ page }) => {
  const res = await page.goto("/cv");
  expect(res?.status()).toBe(200);

  const text = await page.locator("body").innerText();
  expect(text).toContain("Mercedes-AMG Petronas F1");
  expect(text).toContain("PangeAI");
  expect(text).not.toContain("gmai.com");
  expect(text).not.toMatch(/\d(?:\s?\d){8,}/);

  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(255, 255, 255)");
});
