import { expect, test } from "@playwright/test";
import { copy } from "../../src/content/copy";
import { projects } from "../../src/content/projects";
import { openWin, settle, skipSetup, win } from "./helpers";

const trip = projects.find((p) => p.id === "trip");

test("trip planner down: the guest note and the new-tab link still work", async ({
  page,
}, info) => {
  test.skip(info.project.name === "phone", "embed fallback is checked on the desktop");
  if (!trip?.embed || !trip.link) throw new Error("trip project needs an embed and a link");

  await page.route("**/grouptriphero.brittanyperera.com/**", (r) => r.abort());
  await skipSetup(page, "friend");
  await page.goto("/");
  await settle(page, info);
  await openWin(page, "project:trip");

  const w = win(page, "project:trip");
  await expect(w.getByText(trip.embed.note)).toBeVisible();
  const link = w.getByRole("button", { name: trip.link.label });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.getByRole("alertdialog")).toContainText(copy.alerts.leave.text);
});
