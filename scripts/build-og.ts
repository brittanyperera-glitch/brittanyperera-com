import { chromium } from "@playwright/test";

const URL = "http://localhost:3100/";

async function main() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    // Skip the boot screen and Setup Assistant; the recruiter preset opens About and CV.
    await context.addInitScript(() => {
      localStorage.setItem("bp:setup-done", JSON.stringify({ visitor: "recruiter" }));
    });
    const page = await context.newPage();
    try {
      await page.goto(URL, { waitUntil: "networkidle" });
    } catch {
      console.error(`Cannot reach ${URL}. Start a dev or prod server on port 3100 first.`);
      process.exitCode = 1;
      return;
    }
    await page.locator('section[data-win="about"]').waitFor({ state: "visible" });
    await page.locator('section[data-win="cv"]').waitFor({ state: "visible" });
    await page.screenshot({ path: "public/og.png" });
    console.log("Wrote public/og.png");
  } finally {
    await browser.close();
  }
}

main();
