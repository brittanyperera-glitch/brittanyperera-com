import { expect, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { projects, projectUi } from "../../src/content/projects";
import { openWin, settle, skipSetup, win } from "./helpers";

const trip = projects.find((p) => p.id === "trip");

test("trip site down: the browser window still shows its controls and the new-tab button works", async ({
  page,
}, info) => {
  test.skip(info.project.name === "phone", "embed fallback is checked on the desktop");
  if (!trip) throw new Error("trip project missing");

  await page.route("**/grouptriphero.brittanyperera.com/**", (r) => r.abort());
  await skipSetup(page, "friend");
  await page.goto("/");
  await settle(page, info);
  await openWin(page, "browser:trip");

  const w = win(page, "browser:trip");
  await expect(w.getByRole("textbox", { name: projectUi.address })).toHaveValue(trip.siteUrl);
  await expect(w.getByRole("button", { name: projectUi.reload })).toBeVisible();
  const newTab = w.getByRole("button", { name: projectUi.newTab });
  await expect(newTab).toBeVisible();
  await newTab.click();
  await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.leave.text);
});
