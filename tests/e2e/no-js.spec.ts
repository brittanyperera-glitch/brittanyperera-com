import { expect, test } from "@playwright/test";
import { about } from "../../src/content/about";
import { projects } from "../../src/content/projects";

test.use({ javaScriptEnabled: false });

test("no JavaScript: About me is visible, not a frozen boot screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(about.heading)).toBeVisible();
  await expect(page.locator(".boot")).toBeHidden();
  await expect(page.locator(".setup")).toBeHidden();
});

test("no JavaScript on a phone: About fills the screen, no desktop placement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const about = page.locator('section[data-win="about"]');
  await expect(about).toBeVisible();
  const box = await about.boundingBox();
  expect(box).toMatchObject({ x: 0, y: 22, width: 390, height: 822 });
  const close = await about.locator(".close").boundingBox();
  expect(close?.x).toBeGreaterThanOrEqual(0);
  expect(close?.y).toBeGreaterThanOrEqual(22);
});

test("no JavaScript: every project title is in the HTML", async ({ page }) => {
  await page.goto("/");
  // Markup only: the framework's script payload also carries the titles, which proves nothing.
  const markup = await page.evaluate(() => {
    const root = document.documentElement.cloneNode(true) as HTMLElement;
    for (const el of root.querySelectorAll("script")) el.remove();
    return root.outerHTML;
  });
  for (const p of projects) expect(markup).toContain(p.title);
});
