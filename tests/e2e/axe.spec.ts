import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { siteProjects } from "../../src/content/projects";
import { ALL_WINDOWS, isPhone, openWin, settle, skipSetup } from "./helpers";

for (const id of ALL_WINDOWS) {
  test(`${id}: no serious or critical accessibility violations`, async ({ page }, info) => {
    // The browser windows would load the live sites; the audit covers our markup, offline.
    for (const p of siteProjects) {
      await page.route(`${new URL(p.siteUrl).origin}/**`, (r) => r.abort());
    }
    await skipSetup(page, "friend");
    await page.goto("/");
    await settle(page, info);
    await openWin(page, id);

    const { violations } = await new AxeBuilder({ page })
      .include(`section[data-win="${id}"]`)
      .analyze();
    const blocking = violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
    expect(blocking).toEqual([]);
  });
}
