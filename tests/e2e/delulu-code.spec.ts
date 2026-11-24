import { expect, test } from "@playwright/test";
import { projectUi } from "../../src/content/projects";
import { openWin, settle, skipSetup, win } from "./helpers";

test("the Delulu window offers the code, with no link to the live site", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "desktop only");
  await skipSetup(page, "collab");
  await page.goto("/");
  await settle(page, info);
  await openWin(page, "project:delulu");
  const w = win(page, "project:delulu");
  await expect(w.getByRole("button", { name: projectUi.viewCode })).toBeVisible();
  await expect(w.getByRole("button", { name: projectUi.openSite })).toHaveCount(0);
  await expect(w.locator('a[href*="100-days-of-delulu.vercel.app"]')).toHaveCount(0);
  expect(await w.innerHTML()).not.toContain("100-days-of-delulu.vercel.app");
});
