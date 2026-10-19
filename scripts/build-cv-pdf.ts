import { chromium } from "@playwright/test";

const URL = "http://localhost:3100/cv";

async function main() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    try {
      await page.goto(URL, { waitUntil: "networkidle" });
    } catch {
      console.error(`Cannot reach ${URL}. Start a dev or prod server on port 3100 first.`);
      process.exitCode = 1;
      return;
    }
    await page.pdf({
      path: "public/Brittany-Perera-CV.pdf",
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });
    console.log("Wrote public/Brittany-Perera-CV.pdf");
  } finally {
    await browser.close();
  }
}

main();
