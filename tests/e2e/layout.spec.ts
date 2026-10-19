import { expect, type Page, test } from "@playwright/test";
import { projects } from "../../src/content/projects";
import { ALL_WINDOWS, openWin, openWindows, settle, skipSetup } from "./helpers";

type Size = { width: number; height: number };

// The browser windows would load the live sites; layout does not need them, and the run stays offline.
async function blockSites(page: Page) {
  for (const p of projects) {
    await page.route(`${new URL(p.siteUrl).origin}/**`, (r) => r.abort());
  }
}

const DESKTOP_SIZES: Size[] = [
  { width: 1680, height: 1050 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 600 },
  { width: 768, height: 1024 },
];
const PHONE_SIZE: Size = { width: 390, height: 844 };

type Box = { x: number; y: number; width: number; height: number };

function inside(box: Box | null, vp: Size): string | null {
  if (!box) return "not rendered";
  if (box.x < 0 || box.y < 0 || box.x + box.width > vp.width || box.y + box.height > vp.height) {
    return `${JSON.stringify(box)} outside ${vp.width}x${vp.height}`;
  }
  return null;
}

async function problems(page: Page, vp: Size): Promise<string[]> {
  const out: string[] = [];
  const wins = openWindows(page);
  for (let i = 0; i < (await wins.count()); i++) {
    const w = wins.nth(i);
    const id = await w.getAttribute("data-win");
    for (const part of [".close", ".titlebar"]) {
      const bad = inside(await w.locator(part).boundingBox(), vp);
      if (bad) out.push(`${id} ${part}: ${bad}`);
    }
  }
  const icons = page.locator(".icons .icon");
  for (let i = 0; i < (await icons.count()); i++) {
    const bad = inside(await icons.nth(i).boundingBox(), vp);
    if (bad) out.push(`icon ${i}: ${bad}`);
  }
  return out;
}

for (const size of DESKTOP_SIZES) {
  test(`every window opened at ${size.width}x${size.height}: controls stay on screen`, async ({
    page,
  }, info) => {
    test.skip(info.project.name === "phone", "desktop sizes run in the desktop project");
    await blockSites(page);
    await page.setViewportSize(size);
    await skipSetup(page, "friend");
    await page.goto("/");
    await settle(page, info);

    for (const id of ALL_WINDOWS) {
      await openWin(page, id);
      expect(await problems(page, size), `after opening ${id}`).toEqual([]);
    }
  });
}

test("every window opened at 390x844: controls stay on screen", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone size runs in the phone project");
  await blockSites(page);
  await page.setViewportSize(PHONE_SIZE);
  await skipSetup(page, "friend");
  await page.goto("/");
  await settle(page, info);
  expect(await problems(page, PHONE_SIZE), "before opening anything").toEqual([]);

  for (const id of ALL_WINDOWS) {
    await openWin(page, id);
    expect(await problems(page, PHONE_SIZE), `after opening ${id}`).toEqual([]);
  }
});
