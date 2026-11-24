import { expect, test } from "@playwright/test";
import { skipSetup, win } from "./helpers";

test("double-clicking an icon inside a window selects no text", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "icons open on a single tap there");
  await skipSetup(page, "collab");
  await page.goto("/");
  const projects = win(page, "projects");
  await expect(projects).toBeVisible();
  const icon = projects.locator("button.icon").first();
  await expect(icon).toHaveCSS("user-select", "none");
  await icon.dblclick();
  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? "");
  expect(selected).toBe("");
});
