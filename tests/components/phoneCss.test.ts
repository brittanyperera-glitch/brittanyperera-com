import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/phone.css", "utf8");
const home = readFileSync("src/styles/phone-home.css", "utf8");

type Rule = { selectors: string[]; decls: string };

// Every rule inside every `@media (max-width: 700px)` block of one stylesheet (blocks are one level
// deep, so a plain rule matcher is enough).
function phoneRules(source: string): Rule[] {
  const rules: Rule[] = [];
  let from = 0;
  for (;;) {
    const at = source.indexOf("@media (max-width: 700px)", from);
    if (at < 0) return rules;
    const open = source.indexOf("{", at);
    let depth = 1;
    let i = open + 1;
    while (depth > 0) {
      if (source[i] === "{") depth++;
      if (source[i] === "}") depth--;
      i++;
    }
    const inner = source.slice(open + 1, i - 1).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of inner.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = m[1].split(",").map((s) => s.replace(/\s+/g, " ").trim());
      rules.push({ selectors, decls: m[2] });
    }
    from = i;
  }
}

const find = (rules: Rule[], selector: string): string => {
  const hit = rules.find((r) => r.selectors.includes(selector));
  if (!hit) throw new Error(`no phone rule for ${selector}`);
  return hit.decls;
};

const phone = phoneRules(css);
const phoneHome = phoneRules(home);

const tokens: Record<string, string> = {};
for (const m of css.matchAll(/--ph-([a-z0-9-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
const hex = (name: string): string => {
  const v = tokens[name];
  if (!v || !/^#[0-9a-f]{6}$/i.test(v))
    throw new Error(`token --ph-${name} is not a #rrggbb: ${v}`);
  return v;
};

const channels = (h: string) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
function luminance([r, g, b]: number[]): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}
function ratio(a: number[], b: number[]): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const between = (a: string, b: string) => ratio(channels(hex(a)), channels(hex(b)));

// rgba(r, g, b, a) token laid over an opaque backdrop.
function over(token: string, backdrop: number[]): number[] {
  const m = tokens[token]?.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!m) throw new Error(`token --ph-${token} is not an rgba(): ${tokens[token]}`);
  const alpha = Number(m[4]);
  return [1, 2, 3].map((i) => Math.round(Number(m[i]) * alpha + backdrop[i - 1] * (1 - alpha)));
}

const px = (decls: string, prop: string) => {
  const m = decls.match(new RegExp(`(?:^|\\s)${prop}:\\s*(-?\\d+)px`));
  if (!m) throw new Error(`no ${prop} in ${decls}`);
  return Number(m[1]);
};

const surfaces = ["bg", "cell", "raised"];

describe("phone dark tokens", () => {
  it("are defined once, in phone.css, under the phone media query", () => {
    for (const name of [
      "bg",
      "cell",
      "raised",
      "sep",
      "hair",
      "text",
      "text2",
      "link",
      "btn-top",
      "btn-bot",
      "ring",
      "glass",
      "wall-top",
      "wall-mid",
      "wall-bot",
    ]) {
      expect(tokens, name).toHaveProperty(name);
    }
    expect(find(phone, "html:has(.desktop)")).toMatch(/color-scheme:\s*dark/);
  });

  it.each(surfaces)("primary text is at least 4.5:1 on %s", (s) => {
    expect(between("text", s)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(surfaces)("secondary text is at least 4.5:1 on %s", (s) => {
    expect(between("text2", s)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(surfaces)("link blue is at least 4.5:1 on %s", (s) => {
    expect(between("link", s)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["btn-top", "btn-bot"])("white button text is at least 4.5:1 on %s", (stop) => {
    expect(ratio([255, 255, 255], channels(hex(stop)))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["bg", () => channels(hex("bg"))],
    ["cell", () => channels(hex("cell"))],
    ["raised", () => channels(hex("raised"))],
    ["glass over the lightest wallpaper stop", () => over("glass", channels(hex("wall-top")))],
    ["glass over black", () => over("glass", [0, 0, 0])],
    ["wallpaper top", () => channels(hex("wall-top"))],
    ["wallpaper bottom", () => channels(hex("wall-bot"))],
  ])("the focus ring is at least 3:1 against %s", (_n, neighbour) => {
    expect(ratio(channels(hex("ring")), neighbour())).toBeGreaterThanOrEqual(3);
  });

  it("white text on the glass card and nav bar is at least 4.5:1 even over the lightest wallpaper", () => {
    expect(
      ratio(channels(hex("text")), over("glass", channels(hex("wall-top")))),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("the who's-visiting pills take their focus ring from the token", () => {
    const decls = phoneHome.find((r) => r.selectors.includes(".pill:focus-visible"))?.decls;
    expect(decls).toMatch(/outline:\s*3px solid var\(--ph-ring\)/);
  });
});

describe("phone.css", () => {
  it.each([
    ["the back button", ".desktop .win .titlebar .close"],
    ["the Download PDF button", '.desktop .win[data-win="cv"] .doc-toolbar .pbtn'],
  ])("%s is white on the button gradient tokens", (_n, selector) => {
    const decls = find(phone, selector);
    expect(decls).toMatch(/color:\s*#fff;/);
    expect(decls).toMatch(
      /linear-gradient\(to bottom,\s*var\(--ph-btn-top\),\s*var\(--ph-btn-bot\)\)/,
    );
  });

  it("the back button's hit area is at least 44px tall", () => {
    const height = px(find(phone, ".desktop .win .titlebar .close"), "height");
    const reach = -px(find(phone, ".desktop .win .titlebar .close::after"), "inset");
    expect(height + 2 * reach).toBeGreaterThanOrEqual(44);
  });

  it("every phone .pbtn is at least 44px tall", () => {
    expect(px(find(phone, ".desktop .win .pbtn"), "min-height")).toBeGreaterThanOrEqual(44);
  });
});

// A light surface on a phone is a bug: the whole phone view is dark. A highlight or a text fill is
// not a surface, so these two are the only exceptions.
const LIGHT_OK = new Set([
  ".phone-ic::after", // the glossy sheen on a coloured app icon
  ".browser-page iframe", // a live third-party site paints its own page; a transparent one needs a white canvas
]);

describe("phone-scoped rules", () => {
  const files = readdirSync("src/styles").filter((f) => f.endsWith(".css"));

  it.each(files)("%s has no light background literal inside a 700px block", (file) => {
    const bad: string[] = [];
    for (const r of phoneRules(readFileSync(`src/styles/${file}`, "utf8"))) {
      if (r.selectors.every((s) => LIGHT_OK.has(s))) continue;
      for (const m of r.decls.matchAll(/(?:^|[\s;])background(?:-color|-image)?:\s*([^;]+)/g)) {
        const value = m[1];
        const light =
          /#fff\b|#ffffff\b|\bwhite\b/i.test(value) ||
          [...value.matchAll(/rgba\(\s*255,\s*255,\s*255,\s*([\d.]+)\)/g)].some(
            (a) => Number(a[1]) > 0.5,
          );
        if (light) bad.push(`${r.selectors.join(", ")} -> ${value.trim()}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
