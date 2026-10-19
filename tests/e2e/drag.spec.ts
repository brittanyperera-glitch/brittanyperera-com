import { expect, type Page, test } from "@playwright/test";
import { skipSetup, win } from "./helpers";

// Mirrors KEEP_X, KEEP_Y and MENU_BAR in src/lib/windows.ts: the clamp leaves 80px of title bar on
// screen horizontally, keeps the window's top edge at least 40px above the viewport bottom, and
// below the 24px menu bar.
const KEEP_X = 80;
const KEEP_Y = 40;
const MENU_BAR = 24;

const CORNERS = [
  { name: "top-left", x: -3000, y: -3000 },
  { name: "top-right", x: 6000, y: -3000 },
  { name: "bottom-right", x: 6000, y: 6000 },
  { name: "bottom-left", x: -3000, y: 6000 },
] as const;

type Box = { x: number; y: number; width: number; height: number };

async function box(page: Page, selector: string): Promise<Box> {
  const b = await page.locator(selector).boundingBox();
  if (!b) throw new Error(`${selector} not rendered`);
  return b;
}

test("dragging About into each of the four corners keeps its title bar reachable", async ({
  page,
}, info) => {
  test.skip(info.project.name === "phone", "windows do not drag on a phone");
  await skipSetup(page, "friend");
  await page.goto("/");
  await expect(win(page, "about")).toBeVisible();
  const vp = page.viewportSize();
  if (!vp) throw new Error("no viewport");
  const barSel = 'section[data-win="about"] .titlebar';
  const sectionSel = 'section[data-win="about"]';

  for (const c of CORNERS) {
    // Press on the part of the bar that is on screen NOW: after the previous drag the bar's centre
    // can be off screen, and a press there never reaches the window.
    const bar = await box(page, barSel);
    const left = Math.max(bar.x, 0);
    const right = Math.min(bar.x + bar.width, vp.width);
    const px = (left + right) / 2;
    const py = bar.y + bar.height / 2;
    expect(px, `${c.name}: press point is horizontally on screen`).toBeGreaterThan(0);
    expect(px).toBeLessThan(vp.width);
    expect(py, `${c.name}: press point is vertically on screen`).toBeLessThan(vp.height);
    const hit = await page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return {
          inBar: !!el?.closest('section[data-win="about"] .titlebar'),
          button: !!el?.closest("button"),
        };
      },
      [px, py],
    );
    expect(hit, `${c.name}: the press lands on the title bar, not its close box`).toEqual({
      inBar: true,
      button: false,
    });

    await page.mouse.move(px, py);
    await page.mouse.down();
    await page.mouse.move(c.x, c.y, { steps: 6 });
    await page.mouse.up();

    const r = await box(page, barSel);
    const s = await box(page, sectionSel);
    const visibleWidth = Math.min(r.x + r.width, vp.width) - Math.max(r.x, 0);
    expect(visibleWidth, `${c.name}: horizontal title bar on screen`).toBeGreaterThanOrEqual(80);
    expect(r.y, `${c.name}: title bar below the menu bar`).toBeGreaterThanOrEqual(MENU_BAR);
    expect(r.y + r.height, `${c.name}: title bar within the viewport`).toBeLessThanOrEqual(
      vp.height,
    );

    // The clamps were actually reached, not merely satisfied by a window that never moved.
    if (c.y < 0) expect(s.y, `${c.name}: top clamp`).toBeCloseTo(MENU_BAR, 0);
    else expect(s.y, `${c.name}: bottom clamp`).toBeCloseTo(vp.height - KEEP_Y, 0);
    if (c.x < 0) expect(r.x + r.width, `${c.name}: left clamp`).toBeCloseTo(KEEP_X, 0);
    else expect(r.x, `${c.name}: right clamp`).toBeCloseTo(vp.width - KEEP_X, 0);
  }
});
