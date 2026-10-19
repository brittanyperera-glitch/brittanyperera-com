import { expect, type Page, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { collectPageErrors, isPhone, runAssistant, settle, skipSetup, win } from "./helpers";

// Recruiter lands on the CV alone, on a desktop and on a phone (the phone also shows its alert).
async function expectRecruiterLanding(page: Page, phone: boolean) {
  await expect(win(page, "cv")).toBeVisible();
  await expect(page.locator("section[data-win]:not([hidden])")).toHaveCount(1);
  await expect(win(page, "projects")).toBeHidden();
  if (phone) await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.phone);
}

test("fresh visit: the recruiter flow (Continue, I'm hiring, Continue, Go Ahead) lands on the CV", async ({
  page,
}, info) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectRecruiterLanding(page, isPhone(info));
});

test("fresh visit: the friend flow lands on the CV, not an About me window", async ({
  page,
}, info) => {
  await page.goto("/");
  await runAssistant(page, "friend");
  await expect(win(page, "cv")).toBeVisible();
  await expect(page.locator("section[data-win]:not([hidden])")).toHaveCount(1);
  await expect(page.locator('section[data-win="about"]')).toHaveCount(0);
  if (isPhone(info)) await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.phone);
});

test("Esc on first paint skips setup to the CV", async ({ page }, info) => {
  await page.goto("/");
  // Pressed until it lands: before hydration the key listener does not exist yet.
  await expect(async () => {
    await page.keyboard.press("Escape");
    await expect(page.locator(".boot, .setup")).toHaveCount(0, { timeout: 500 });
  }).toPass();
  await expectRecruiterLanding(page, isPhone(info));
});

test("after finishing, a reload skips setup", async ({ page }, info) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectRecruiterLanding(page, isPhone(info));
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
}, info) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectRecruiterLanding(page, isPhone(info));
  if (isPhone(info)) await page.keyboard.press("Escape");
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

test("setup completes with no page errors when localStorage throws", async ({ page }, info) => {
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
  await expectRecruiterLanding(page, isPhone(info));
  expect(errors.map((e) => e.message)).toEqual([]);
});
