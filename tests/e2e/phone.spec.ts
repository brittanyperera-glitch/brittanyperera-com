import { mkdirSync } from "node:fs";
import { expect, type Page, type TestInfo, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { cv } from "../../src/content/cv";
import { music } from "../../src/content/music";
import { siteProjects } from "../../src/content/projects";
import { truths } from "../../src/content/truths";
import { ALL_WINDOWS, openWin, settle, skipSetup, win } from "./helpers";

const SIZES = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];
const SHOT_SIZE = { width: 390, height: 844 };
const PHONE_WINDOWS = ALL_WINDOWS;

test.beforeEach(async ({ page: _page }, info) => {
  test.skip(info.project.name !== "phone", "the phone view is phone-project only");
});

// The browser windows would load the live sites; none of this needs them, and the run stays offline.
async function blockSites(page: Page) {
  for (const p of siteProjects) {
    await page.route(`${new URL(p.siteUrl).origin}/**`, (r) => r.abort());
  }
}

/** A returning visitor on a phone: straight to the home screen, at the given size. */
async function landOnHome(page: Page, size: { width: number; height: number }, info: TestInfo) {
  await blockSites(page);
  await page.setViewportSize(size);
  await skipSetup(page, "friend");
  await page.goto("/");
  await settle(page, info);
}

/** What spills past the right edge of the screen in the open window, and which bodies scroll sideways. */
function sidewaysProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const w of document.querySelectorAll("section[data-win]:not([hidden])")) {
      const id = (w as HTMLElement).dataset.win;
      for (const el of [w, ...w.querySelectorAll("*")]) {
        if (!(el as HTMLElement).checkVisibility({ visibilityProperty: true })) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.right > vw + 0.5) {
          out.push(
            `${id}: <${el.tagName.toLowerCase()} class="${el.className}"> right ${r.right} > ${vw}`,
          );
        }
      }
      for (const b of w.querySelectorAll<HTMLElement>(".body")) {
        if (b.scrollWidth > b.clientWidth) {
          out.push(`${id}: .body scrollWidth ${b.scrollWidth} > clientWidth ${b.clientWidth}`);
        }
      }
    }
    return out;
  });
}

for (const size of SIZES) {
  test(`phone ${size.width}x${size.height}: every app stays inside the screen width`, async ({
    page,
  }, info) => {
    await landOnHome(page, size, info);
    const found: string[] = [];
    for (const id of PHONE_WINDOWS) {
      await openWin(page, id);
      found.push(...(await sidewaysProblems(page)));
    }
    expect(found).toEqual([]);
  });
}

// iOS's smallest text style (Caption 2) is 11pt; anything under 12px reads as laptop text shrunk.
test("phone 390x844: no visible text in any app is smaller than 12px", async ({ page }, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  const found: string[] = [];
  for (const id of PHONE_WINDOWS) {
    await openWin(page, id);
    found.push(
      ...(await page.evaluate(() => {
        const out: string[] = [];
        for (const w of document.querySelectorAll("section[data-win]:not([hidden])")) {
          for (const el of w.querySelectorAll<HTMLElement>("*")) {
            const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
            if (!own || !el.checkVisibility({ visibilityProperty: true })) continue;
            const size = Number.parseFloat(getComputedStyle(el).fontSize);
            if (size < 12) {
              out.push(
                `${(w as HTMLElement).dataset.win}: ${size}px "${el.textContent?.trim().slice(0, 30)}"`,
              );
            }
          }
        }
        return out;
      })),
    );
  }
  expect([...new Set(found)]).toEqual([]);
});

test("phone 320x568: a long unbroken string in an app wraps instead of widening it", async ({
  page,
}, info) => {
  await landOnHome(page, SIZES[0], info);
  await openWin(page, "contact");
  // An email-length token with no break point, as a new contact line might be.
  await win(page, "contact")
    .locator(".body")
    .evaluate((b) => {
      const p = document.createElement("p");
      p.textContent = `x${"verylongunbrokentoken".repeat(6)}`;
      b.append(p);
    });
  expect(await sidewaysProblems(page)).toEqual([]);
});

test("phone 320x568: Photos shows a three-column thumbnail grid that does not scroll sideways", async ({
  page,
}, info) => {
  await landOnHome(page, SIZES[0], info);
  await openPhotosGrid(page);
  const columns = await page
    .locator(".photo-grid")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(3);
  const body = win(page, "photos").locator(".body");
  const [scroll, client] = await body.evaluate((b) => [b.scrollWidth, b.clientWidth]);
  expect(scroll).toBeLessThanOrEqual(client);
});

/** Photos opens on the thumbnail grid. */
async function openPhotosGrid(page: Page) {
  await openWin(page, "photos");
  await expect(page.locator(".photo-thumb").first()).toBeVisible();
}

test("phone: the CV scrolls inside the app to the languages heading", async ({ page }, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  await openWin(page, "cv");
  const heading = win(page, "cv").getByRole("heading", { name: cv.sections.languages });
  await expect(heading).toBeAttached();
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
  const scrolled = await win(page, "cv")
    .locator(".body")
    .evaluate((b) => b.scrollTop);
  expect(scrolled).toBeGreaterThan(0);
});

test("phone: Photos thumbnails are square and the first row has loaded", async ({ page }, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  await openPhotosGrid(page);
  const imgs = page.locator(".photo-thumb img");
  // The width/height attributes must not beat aspect-ratio: a 240px height on a 130px tile draws it tall.
  for (let i = 0; i < 6; i++) {
    const box = await imgs.nth(i).boundingBox();
    if (!box) throw new Error(`thumbnail ${i} has no box`);
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
  }
  for (let i = 0; i < 3; i++)
    await expect
      .poll(() => imgs.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth))
      .toBeGreaterThan(0);
});

test("phone: Photos opens to a thumbnail grid and a tap opens the viewer", async ({
  page,
}, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  await openPhotosGrid(page);
  const count = await page.locator(".photo-thumb").count();
  expect(count).toBeGreaterThan(1);
  await page.locator(".photo-thumb").first().tap();
  await expect(page.locator(".photo-stage img")).toBeVisible();
  await expect(page.locator(".photo-thumb")).toHaveCount(0);
});

test("phone: Two Truths can be played to 'got it'", async ({ page }, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  await openWin(page, "truths");
  const lie = truths.rounds[0].statements.find((s) => s.lie)?.text;
  if (!lie) throw new Error("round 1 has no lie");
  await win(page, "truths").getByRole("button", { name: lie }).tap();
  await expect(win(page, "truths").getByRole("status")).toContainText(truths.right);
});

test("phone: Garage starts playing audio", async ({ page }, info) => {
  await landOnHome(page, SHOT_SIZE, info);
  await openWin(page, "garage");
  const g = win(page, "garage");
  await g.getByRole("button", { name: music.ui.play, exact: true }).tap();
  await expect(g.locator(".garage-lcd")).toHaveAttribute("data-state", "play");
  await expect
    .poll(() =>
      g.locator("audio").evaluate((a: HTMLAudioElement) => !a.paused && a.currentTime > 0),
    )
    .toBe(true);
});

test.describe("before any JavaScript runs", () => {
  test.use({ javaScriptEnabled: false });

  test("phone: no lock screen, and the CV is readable", async ({ page }) => {
    await page.setViewportSize(SHOT_SIZE);
    await page.goto("/");
    await expect(page.locator(".phone-lock")).toHaveCount(0);
    await expect(page.locator(".setup")).toBeHidden();
    await expect(page.locator(".phone-home")).toBeHidden();
    const cvWin = win(page, "cv");
    await expect(cvWin).toBeVisible();
    await expect(cvWin.getByText(cv.roles[0].title, { exact: true })).toBeVisible();
    await expect(cvWin.getByRole("heading", { name: cv.sections.languages })).toBeAttached();
    expect(await sidewaysProblems(page)).toEqual([]);
    const size = await cvWin
      .locator(".body li")
      .first()
      .evaluate((p) => parseFloat(getComputedStyle(p).fontSize));
    expect(size).toBeGreaterThanOrEqual(14);
    // Every CV paragraph, not just the bullets: the role lines under headings were 11.5px once.
    const smallest = await cvWin
      .locator(".cv-doc p")
      .evaluateAll((ps) => Math.min(...ps.map((p) => parseFloat(getComputedStyle(p).fontSize))));
    expect(smallest).toBeGreaterThanOrEqual(13);
  });
});

// Reusable evidence run. PHONE_SCREENS_DIR picks the folder (default: this run's output folder), so
// it can be rerun after a visual change: PHONE_SCREENS_DIR=<dir> pnpm exec playwright test phone.spec -g screenshots
test("phone: screenshots of the lock, the home screen and every app at 390x844", async ({
  page,
}, info) => {
  const dir = process.env.PHONE_SCREENS_DIR ?? info.outputPath("screens");
  mkdirSync(dir, { recursive: true });
  const shoot = (name: string) =>
    page.screenshot({ path: `${dir}/${name.replace(/[^a-z0-9]+/gi, "-")}.png` });

  await blockSites(page);
  await page.setViewportSize(SHOT_SIZE);
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: copy.phone.lock.label })).toBeVisible({
    timeout: 15_000,
  });
  await shoot("lock");
  await page.getByRole("button", { name: copy.phone.lock.slide }).click();
  await settle(page, info);
  await shoot("home");
  for (const id of PHONE_WINDOWS) {
    await openWin(page, id);
    await shoot(id);
  }
});
