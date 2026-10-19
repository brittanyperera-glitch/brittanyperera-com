import { expect, type Page, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { collectPageErrors, isPhone, runAssistant, settle, skipSetup, win } from "./helpers";

// Recruiter lands on About + CV on a desktop, CV alone on a phone.
async function expectRecruiterLanding(page: Page, phone: boolean) {
  await expect(win(page, "cv")).toBeVisible();
  if (phone) {
    await expect(win(page, "about")).toBeHidden();
    await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.phone);
  } else {
    await expect(win(page, "about")).toBeVisible();
  }
}

test("fresh visit: all four steps and Go Ahead land on the recruiter windows", async ({
  page,
}, info) => {
  await page.goto("/");
  await runAssistant(page, "recruiter");
  await expectRecruiterLanding(page, isPhone(info));
});

test("Esc on first paint skips setup to About and CV", async ({ page }, info) => {
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
