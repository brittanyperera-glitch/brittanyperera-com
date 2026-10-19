import { expect, test } from "@playwright/test";
import { contact } from "../../src/content/contact";
import { copy } from "../../src/content/copy";
import { openWin, settle, skipSetup, win } from "./helpers";

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard flows are checked on the desktop");
  // "friend" opens only About, so CV starts closed.
  await skipSetup(page, "friend");
  await page.goto("/");
  await settle(page, info);
});

test("Tab reaches the CV icon and Enter opens it", async ({ page }) => {
  await expect(win(page, "cv")).toBeHidden();
  const cvIcon = page.locator('.icons [data-open="cv"]');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await cvIcon.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(cvIcon).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(win(page, "cv")).toBeVisible();
});

test("Esc closes the alert first, then the menu, and focus returns to the opener", async ({
  page,
}) => {
  const special = page.getByRole("button", { name: copy.chrome.menuTitles.special });
  await special.click();
  await expect(special).toHaveAttribute("aria-expanded", "true");

  // Keyboard press, so the open menu is not dismissed by a pointer press on the way to the alert.
  const sound = page.getByRole("button", { name: copy.chrome.soundOff });
  await sound.focus();
  await page.keyboard.press("Enter");
  const alert = page.getByRole("alertdialog");
  await expect(alert).toContainText(copy.alerts.soundOn);
  await expect(special).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(alert).toHaveCount(0);
  await expect(special).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: copy.chrome.soundOn })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(special).toHaveAttribute("aria-expanded", "false");
});

test("focus returns to the menu title after an alert raised from a menu item", async ({ page }) => {
  const special = page.getByRole("button", { name: copy.chrome.menuTitles.special });
  await special.click();
  await page.getByRole("button", { name: copy.menus.special[2].label }).click();
  await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.crash.title);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(special).toBeFocused();
});

test("the address in the copy-failed alert can be selected", async ({ page }) => {
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }),
  );
  await openWin(page, "contact");
  await win(page, "contact").getByRole("button", { name: copy.windows.copyEmail }).click();
  const alert = page.getByRole("alertdialog");
  await expect(alert).toContainText(contact.email);

  const userSelect = await alert
    .locator(".alert-main")
    .evaluate((el) => getComputedStyle(el).userSelect);
  expect(userSelect).toBe("text");

  await alert.locator("#alert-body").click({ clickCount: 3 });
  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? "");
  expect(selected).toContain(contact.email);
});
