import { expect, type Page, test } from "@playwright/test";
import { copy } from "../../src/content/copy";

// Rendered markup with scripts and stylesheets removed: framework payloads and CSS are not copy.
async function renderedCopy(page: Page): Promise<string> {
  return page.evaluate(() => {
    const root = document.documentElement.cloneNode(true) as HTMLElement;
    for (const el of root.querySelectorAll("script, style")) el.remove();
    return root.outerHTML;
  });
}

for (const path of ["/", "/cv", "/does-not-exist"]) {
  test(`${path} has no banned copy`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    const html = await renderedCopy(page);
    expect(html).not.toContain("—");
    expect(html.toLowerCase()).not.toContain("placeholder");
    expect(html).not.toContain("goes here");
    expect(html).not.toContain("[ ");
    expect(html).not.toContain("Mockup v");
    expect((await page.content()).includes("—")).toBe(false);
  });
}

test("404 shows the bomb alert and Restart goes home", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  const alert = page.getByRole("alertdialog");
  await expect(alert).toContainText(copy.alerts.crash.title);
  await expect(alert.locator("svg")).toBeVisible();
  await alert.getByRole("link", { name: copy.alerts.crash.button }).click();
  await expect(page).toHaveURL(/\/$/);
});
