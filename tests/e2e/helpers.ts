import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { projects } from "../../src/content/projects";
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

export const win = (page: Page, id: WinId): Locator => page.locator(`section[data-win="${id}"]`);

export const openWindows = (page: Page): Locator => page.locator("section[data-win]:not([hidden])");

/** Wait for hydration to finish removing the boot and setup overlays, then clear the phone alert. */
export async function settle(page: Page, info: TestInfo) {
  await expect(page.locator(".boot, .setup")).toHaveCount(0);
  if (isPhone(info)) {
    const alert = page.getByRole("alertdialog");
    await expect(alert).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(alert).toHaveCount(0);
  }
}

/** Opens a window the way a keyboard user would: focus its icon and press Enter. */
export async function openWin(page: Page, id: WinId) {
  if (id.startsWith("project:")) {
    const title = projects.find((p) => `project:${p.id}` === id)?.title;
    if (!title) throw new Error(`unknown project window ${id}`);
    if (!(await win(page, "projects").isVisible())) await openWin(page, "projects");
    await win(page, "projects").locator("button.icon", { hasText: title }).focus();
  } else {
    await page.locator(`.icons [data-open="${id}"]`).focus();
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
  "about",
  "cv",
  "projects",
  "contact",
  "trash",
  ...projects.map((p) => `project:${p.id}` as WinId),
];
