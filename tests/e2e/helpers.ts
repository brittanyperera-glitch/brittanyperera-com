import { expect, type Locator, type Page, type TestInfo, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { music } from "../../src/content/music";
import { projects, projectUi, siteProjects } from "../../src/content/projects";
import type { Visitor, WinId } from "../../src/lib/types";

export const SETUP_KEY = "bp:setup-done";

export const isPhone = (info: TestInfo) => info.project.name === "phone";

/**
 * Pretend the visitor already finished setup. Seeds once per tab (sessionStorage guard), so a
 * reload or "Restart setup" later in the test is not undone by the init script running again.
 */
export async function skipSetup(page: Page, visitor: Visitor = "recruiter") {
  await page.addInitScript(
    ([key, v]) => {
      try {
        if (sessionStorage.getItem("e2e-seeded")) return;
        sessionStorage.setItem("e2e-seeded", "1");
        localStorage.setItem(key, JSON.stringify({ visitor: v }));
      } catch {
        // storage blocked: nothing to seed
      }
    },
    [SETUP_KEY, visitor],
  );
}

/**
 * Apps with a laptop icon but no way in on a phone (not in copy.phone.apps, src/content/copy.ts).
 * Phone specs skip them with a fixme; drop an id here once the home screen carries it.
 */

export const win = (page: Page, id: WinId): Locator => page.locator(`section[data-win="${id}"]`);

export const openWindows = (page: Page): Locator => page.locator("section[data-win]:not([hidden])");

/**
 * Wait for hydration to finish removing the boot and setup overlays. On a phone that also means
 * the home screen is live: it is inert until the client knows it is a phone.
 */
export async function settle(page: Page, info: TestInfo) {
  await expect(page.locator(".boot, .setup")).toHaveCount(0);
  if (isPhone(info)) {
    await expect(page.locator(".phone-home")).not.toHaveAttribute("inert");
    // The dev server's badge sits over the dock's first icon and swallows taps; a visitor never sees it.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  }
}

/** Phone only: back out of whatever is open (each back goes to the parent) until the home screen shows. */
export async function goHome(page: Page) {
  const front = page.locator("section[data-win]:not([hidden]) .close");
  for (let i = 0; i < 6 && (await front.count()) > 0; i++) await front.last().click();
  await expect(page.locator("section[data-win]:not([hidden])")).toHaveCount(0);
}

/** The visitor's own way to a top-level app: its icon on the desktop, or on the phone's home screen. */
async function openTopLevel(page: Page, id: WinId) {
  const info = test.info();
  if (isPhone(info)) {
    await goHome(page);
    await page.locator(`.phone-home [data-open="${id}"]`).tap();
    return;
  }
  await page.locator(`.icons [data-open="${id}"]`).focus();
  await page.keyboard.press("Enter");
}

/** Opens a window as a visitor would: Enter on its icon (laptop), a tap on its home-screen icon (phone). */
export async function openWin(page: Page, id: WinId) {
  if (id.startsWith("browser:")) {
    // The way in is the About window's default button, as for a visitor.
    const about = `project:${id.slice("browser:".length)}` as WinId;
    if (!(await win(page, about).isVisible())) await openWin(page, about);
    await win(page, about).getByRole("button", { name: projectUi.openSite }).focus();
  } else if (id.startsWith("project:")) {
    const title = projects.find((p) => `project:${p.id}` === id)?.title;
    if (!title) throw new Error(`unknown project window ${id}`);
    if (!(await win(page, "projects").isVisible())) await openWin(page, "projects");
    await win(page, "projects").locator("button.icon", { hasText: title }).focus();
  } else if (id === "garage") {
    if (!(await win(page, "music").isVisible())) await openWin(page, "music");
    await win(page, "music").locator("button.icon", { hasText: music.appName }).focus();
  } else {
    await openTopLevel(page, id);
    await expect(win(page, id)).toBeVisible();
    return;
  }
  await page.keyboard.press("Enter");
  await expect(win(page, id)).toBeVisible();
}

export function collectPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  return errors;
}

/** Click through the three Setup Assistant steps and Go Ahead, picking the given visitor. */
export async function runAssistant(page: Page, visitor: Visitor = "recruiter") {
  const s = copy.setup;
  const dialog = page.getByRole("dialog", { name: s.windowTitle });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog.getByRole("button", { name: s.next }).click();
  const label = s.visitors.find((v) => v.id === visitor)?.label ?? visitor;
  await dialog.getByRole("radio", { name: label }).click();
  await dialog.getByRole("button", { name: s.next }).click();
  await dialog.getByRole("button", { name: s.goAhead }).click();
  await expect(dialog).toHaveCount(0, { timeout: 20_000 });
}

export const ALL_WINDOWS: WinId[] = [
  "cv",
  "projects",
  "contact",
  "trash",
  "music",
  "garage",
  "photos",
  "youtube",
  "truths",
  ...projects.map((p) => `project:${p.id}` as WinId),
  ...siteProjects.map((p) => `browser:${p.id}` as WinId),
];
