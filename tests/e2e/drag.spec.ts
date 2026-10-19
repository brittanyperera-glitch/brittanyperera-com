import { expect, test } from "@playwright/test";
import { skipSetup, win } from "./helpers";

const CORNERS = [
  { name: "top-left", x: -3000, y: -3000 },
  { name: "top-right", x: 6000, y: -3000 },
  { name: "bottom-right", x: 6000, y: 6000 },
  { name: "bottom-left", x: -3000, y: 6000 },
];

test("dragging About into any corner keeps its title bar reachable", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "windows do not drag on a phone");
  await skipSetup(page, "friend");
  await page.goto("/");
  const about = win(page, "about");
  await expect(about).toBeVisible();
  const bar = about.locator(".titlebar");
  const vp = page.viewportSize();
  if (!vp) throw new Error("no viewport");

  for (const c of CORNERS) {
    const before = await bar.boundingBox();
    if (!before) throw new Error("title bar not rendered");
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(c.x, c.y, { steps: 6 });
    await page.mouse.up();

    const r = await bar.boundingBox();
    if (!r) throw new Error("title bar not rendered");
    const visibleWidth = Math.min(r.x + r.width, vp.width) - Math.max(r.x, 0);
    expect(visibleWidth, `${c.name}: horizontal title bar on screen`).toBeGreaterThanOrEqual(80);
    expect(r.y, `${c.name}: title bar below the menu bar`).toBeGreaterThanOrEqual(24);
    expect(r.y + r.height, `${c.name}: title bar within the viewport`).toBeLessThanOrEqual(
      vp.height,
    );
  }
});
