import { expect, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { openWin, settle, skipSetup, win } from "./helpers";

test("phone: the title bar says Close on a top-level window and Back on a project window", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "phone", "the label is phone-only");
  await skipSetup(page, "recruiter");
  await page.goto("/");
  await settle(page, info);

  const label = (id: "cv" | "projects" | "project:trip") => win(page, id).locator(".close-label");

  await expect(label("cv")).toBeVisible();
  await expect(label("cv")).toHaveText(copy.chrome.closeLabel);

  await openWin(page, "projects");
  await expect(label("projects")).toHaveText(copy.chrome.closeLabel);

  await openWin(page, "project:trip");
  const back = label("project:trip");
  await expect(back).toBeVisible();
  await expect(back).toHaveText(copy.chrome.back);

  // The label sits inside the viewport and clear of the window title.
  const vp = page.viewportSize();
  if (!vp) throw new Error("no viewport");
  const b = await back.boundingBox();
  const t = await win(page, "project:trip").locator(".titlebar .t").boundingBox();
  if (!b || !t) throw new Error("title bar parts not rendered");
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(t.x);
  expect(b.y).toBeGreaterThanOrEqual(22);

  // It is the close control: pressing the label goes back to the folder.
  await back.click();
  await expect(win(page, "project:trip")).toBeHidden();
  await expect(win(page, "projects")).toBeVisible();
});

test("desktop: the title bar shows no text label next to the close box", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "desktop only");
  await skipSetup(page, "recruiter");
  await page.goto("/");
  await settle(page, info);
  await expect(win(page, "cv")).toBeVisible();
  await expect(win(page, "cv").locator(".close-label")).toBeHidden();
});
