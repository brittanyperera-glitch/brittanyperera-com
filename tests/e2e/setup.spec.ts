import { expect, type Page, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import type { Visitor } from "../../src/lib/types";
import { collectPageErrors, isPhone, runAssistant, settle, skipSetup, win } from "./helpers";

// A laptop lands on the full landing set (copy.firstWindows). A phone gets the lock and home screen
// instead (see the phone describe at the end); the Setup Assistant is laptop-only.
const LAPTOP_ONLY = "a phone gets the lock screen, not the Setup Assistant";

test.beforeEach(async ({ page: _page }, info) => {
  test.skip(isPhone(info) && !info.title.startsWith("phone:"), LAPTOP_ONLY);
  test.skip(!isPhone(info) && info.title.startsWith("phone:"), "the lock screen is phone-only");
});

async function expectLanding(page: Page, visitor: Visitor = "recruiter") {
  await expect(win(page, "cv")).toBeVisible();
  const open = page.locator("section[data-win]:not([hidden])");
  await expect(open).toHaveCount(copy.firstWindows[visitor].length);
  for (const id of copy.firstWindows[visitor]) await expect(win(page, id)).toBeVisible();
}

test("fresh visit: the recruiter flow (Continue, I'm hiring, Continue, Go Ahead) lands on the CV", async ({
  page,
}) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectLanding(page);
});

test("fresh visit: the friend flow lands on the CV, not an About me window", async ({ page }) => {
  await page.goto("/");
  await runAssistant(page, "friend");
  await expectLanding(page, "friend");
  await expect(page.locator('section[data-win="about"]')).toHaveCount(0);
});

test("Esc on first paint skips setup to the CV", async ({ page }) => {
  await page.goto("/");
  // Pressed until it lands: before hydration the key listener does not exist yet.
  await expect(async () => {
    await page.keyboard.press("Escape");
    await expect(page.locator(".boot, .setup")).toHaveCount(0, { timeout: 500 });
  }).toPass();
  await expectLanding(page);
});

test("after finishing, a reload skips setup", async ({ page }) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectLanding(page);
  await page.reload();
  // The server HTML always carries the boot screen; hydration must remove it without the assistant.
  await expect(page.locator(".boot, .setup")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: copy.setup.windowTitle })).toHaveCount(0);
  await expect(win(page, "cv")).toBeVisible();
});

test("Special > Restart setup > Restart brings setup back", async ({ page }, info) => {
  await skipSetup(page, "recruiter");
  await page.goto("/");
  await settle(page, info);

  await page.getByRole("button", { name: "Special" }).click();
  await page.getByRole("button", { name: "Restart setup" }).click();
  const alert = page.getByRole("alertdialog");
  await expect(alert).toContainText(copy.alerts.restart.text);
  await alert.getByRole("button", { name: copy.alerts.restart.ok }).click();

  await expect(page.getByRole("dialog", { name: copy.setup.windowTitle })).toBeVisible({
    timeout: 15_000,
  });
});

test("Tab during the Setup Assistant never leaves it for the menu bar behind", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: copy.setup.windowTitle });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        inSetup: !!el?.closest(".setup"),
        inMenuBar: !!el?.closest(".menubar"),
        desc: `${el?.tagName}.${el?.className}`,
      };
    });
    expect(where.inMenuBar, `Tab ${i + 1} reached the menu bar`).toBe(false);
    expect(where.inSetup, `Tab ${i + 1} focused ${where.desc} outside the assistant`).toBe(true);
  }
});

test("Tab on the boot screen keeps focus on the boot button", async ({ page }) => {
  await page.goto("/");
  const boot = page.locator(".boot");
  await expect(boot).toBeFocused({ timeout: 10_000 });
  await page.keyboard.press("Tab");
  await expect(page.locator(".menubar button:focus")).toHaveCount(0);
});

test("after setup, focus lands on the front window's close box instead of <body>", async ({
  page,
}) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectLanding(page);
  await expect(win(page, "cv").locator(".close")).toBeFocused();
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the Setup Assistant is visible within a second, with nothing cycling", async ({ page }) => {
    const dialog = page.getByRole("dialog", { name: copy.setup.windowTitle });
    await page.goto("/");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(dialog).toBeVisible({ timeout: 1000 });
    await expect(page.locator(".hello")).toHaveCount(0);
    await expect(page.locator(".hello-all [lang]")).toHaveCount(copy.setup.hello.length);
  });
});

test("a visitor link (?for=client) skips setup and lands for that visitor", async ({
  page,
}, info) => {
  const errors = collectPageErrors(page);
  await page.goto("/?for=client");
  await settle(page, info);
  await expect(page.getByRole("dialog", { name: copy.setup.windowTitle })).toHaveCount(0);
  for (const id of copy.firstWindows.client) await expect(win(page, id)).toBeVisible();
  expect(errors.map((e) => e.message)).toEqual([]);
});

test("an unknown ?for= value runs the normal setup", async ({ page }) => {
  await page.goto("/?for=boss");
  await expect(page.getByRole("dialog", { name: copy.setup.windowTitle })).toBeVisible({
    timeout: 15_000,
  });
});

test("setup completes with no page errors when localStorage throws", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.addInitScript(() => {
    const deny = () => {
      throw new DOMException("storage blocked", "SecurityError");
    };
    Storage.prototype.getItem = deny;
    Storage.prototype.setItem = deny;
    Storage.prototype.removeItem = deny;
  });
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectLanding(page);
  expect(errors.map((e) => e.message)).toEqual([]);
});

// A phone: lock screen for a new visitor, then a home screen. Nothing opens by itself.
const lock = (page: Page) => page.getByRole("dialog", { name: copy.phone.lock.label });
const openApps = (page: Page) => page.locator("section[data-win]:not([hidden])");
const dockApps = (page: Page) => page.locator(".phone-dock [data-open]");

test("phone: a new visitor meets the lock, clicks in, and lands on home with focus on the first icon", async ({
  page,
}) => {
  const errors = collectPageErrors(page);
  await page.goto("/");
  await expect(lock(page)).toBeVisible({ timeout: 15_000 });
  await expect(lock(page)).toContainText(copy.phone.lock.message);
  await expect(page.locator(".boot")).toHaveCount(0);
  await page.getByRole("button", { name: copy.phone.lock.slide }).click();
  await expect(lock(page)).toHaveCount(0);
  await expect(page.locator(".phone-home [data-open]").first()).toBeFocused();
  await expect(openApps(page)).toHaveCount(0);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect(errors.map((e) => e.message)).toEqual([]);
});

test("phone: picking on the who's-visiting card re-docks and a reload skips the lock", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: copy.phone.lock.slide }).click();
  await page.getByRole("button", { name: "I have a project" }).click();
  await expect(dockApps(page).first()).toHaveAttribute("data-open", copy.phone.docks.client[0]);
  await page.reload();
  await expect(lock(page)).toHaveCount(0);
  await expect(dockApps(page).first()).toHaveAttribute("data-open", copy.phone.docks.client[0]);
});

test("phone: a visitor link (?for=client) lands on home with that dock and nothing open", async ({
  page,
}) => {
  await page.goto("/?for=client");
  await expect(lock(page)).toHaveCount(0);
  await expect(dockApps(page).first()).toHaveAttribute("data-open", copy.phone.docks.client[0]);
  await expect(openApps(page)).toHaveCount(0);
});
