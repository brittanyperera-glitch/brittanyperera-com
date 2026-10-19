import { expect, test } from "@playwright/test";
import { about } from "../../src/content/about";
import { contact } from "../../src/content/contact";
import { copy } from "../../src/content/copy";
import { cv } from "../../src/content/cv";
import { projects } from "../../src/content/projects";

test.use({ javaScriptEnabled: false });

test("no JavaScript: About me is visible, not a frozen boot screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(about.heading)).toBeVisible();
  await expect(page.locator(".boot")).toBeHidden();
  await expect(page.locator(".setup")).toBeHidden();
});

test("no JavaScript on a phone: About fills the screen, no desktop placement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const about = page.locator('section[data-win="about"]');
  await expect(about).toBeVisible();
  const box = await about.boundingBox();
  expect(box).toMatchObject({ x: 0, y: 22, width: 390, height: 822 });
  const close = await about.locator(".close").boundingBox();
  expect(close?.x).toBeGreaterThanOrEqual(0);
  expect(close?.y).toBeGreaterThanOrEqual(22);
});

test("no JavaScript: every project title is in the HTML", async ({ page }) => {
  await page.goto("/");
  // Markup only: the framework's script payload also carries the titles, which proves nothing.
  const markup = await page.evaluate(() => {
    const root = document.documentElement.cloneNode(true) as HTMLElement;
    for (const el of root.querySelectorAll("script")) el.remove();
    return root.outerHTML;
  });
  for (const p of projects) expect(markup).toContain(p.title);
});

// A visitor with scripting off must be able to READ everything, not merely have it in the markup.
const NO_JS_SIZES = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

for (const size of NO_JS_SIZES) {
  test(`no JavaScript at ${size.width}x${size.height}: About, CV, projects and email are readable`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === "phone",
      "both sizes are set explicitly in the desktop project",
    );
    await page.setViewportSize(size);
    await page.goto("/");

    const inWin = (id: string) => page.locator(`section[data-win="${id}"]`);

    await expect(inWin("about").getByText(about.heading)).toBeVisible();
    await expect(inWin("about").getByText(about.paragraphs[0])).toBeVisible();
    await expect(inWin("cv").getByText(cv.roles[0].title)).toBeVisible();
    await expect(inWin("cv").getByText(cv.roles[1].title)).toBeVisible();
    for (const p of projects) {
      const w = inWin(`project:${p.id}`);
      await expect(w.getByRole("heading", { name: p.heading })).toBeVisible();
      await expect(w.getByText(p.blurb)).toBeVisible();
    }
    await expect(inWin("contact").getByText(contact.email)).toBeVisible();

    // A static column: nothing positioned over anything else.
    const boxes: { id: string; y: number; bottom: number; position: string }[] = [];
    const visible = page.locator("section[data-win]:visible");
    for (let i = 0; i < (await visible.count()); i++) {
      const w = visible.nth(i);
      const box = await w.boundingBox();
      const position = await w.evaluate((el) => getComputedStyle(el).position);
      if (!box) throw new Error("visible window has no box");
      boxes.push({
        id: (await w.getAttribute("data-win")) ?? "?",
        y: box.y,
        bottom: box.y + box.height,
        position,
      });
    }
    expect(boxes.length).toBeGreaterThanOrEqual(7);
    for (const b of boxes) expect(b.position, `${b.id} position`).toBe("static");
    boxes.sort((a, b) => a.y - b.y);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].y, `${boxes[i].id} starts below ${boxes[i - 1].id}`).toBeGreaterThanOrEqual(
        boxes[i - 1].bottom - 1,
      );
    }
  });

  test(`no JavaScript at ${size.width}x${size.height}: the Open CV link is visible and goes to /cv`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === "phone",
      "both sizes are set explicitly in the desktop project",
    );
    await page.setViewportSize(size);
    await page.goto("/");
    const link = page.getByRole("link", { name: copy.menus.file[0].label });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/cv$/);
    await expect(page.getByRole("heading", { name: cv.name })).toBeVisible();
  });
}
