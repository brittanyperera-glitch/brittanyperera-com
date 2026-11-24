import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/phone.css", "utf8");

// The declarations of the first rule with exactly this selector.
function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no rule for ${selector}`);
  return css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const whiteOn = (hex: string) => 1.05 / (luminance(hex) + 0.05);

const px = (decls: string, prop: string) => {
  const m = decls.match(new RegExp(`(?:^|\\s)${prop}:\\s*(-?\\d+)px`));
  if (!m) throw new Error(`no ${prop} in ${decls}`);
  return Number(m[1]);
};

describe("phone.css", () => {
  it.each([
    ["the back button", ".desktop .win .titlebar .close"],
    ["the Download PDF button", '.desktop .win[data-win="cv"] .doc-toolbar .pbtn'],
  ])("white text on %s is at least 4.5:1 at every gradient stop", (_n, selector) => {
    const stops = rule(selector).match(/#[0-9a-f]{6}/gi) ?? [];
    const fills = stops.slice(0, 2);
    expect(fills).toHaveLength(2);
    for (const hex of fills) expect(whiteOn(hex)).toBeGreaterThanOrEqual(4.5);
  });

  it("the back button's hit area is at least 44px tall", () => {
    const height = px(rule(".desktop .win .titlebar .close"), "height");
    const reach = -px(rule(".desktop .win .titlebar .close::after"), "inset");
    expect(height + 2 * reach).toBeGreaterThanOrEqual(44);
  });

  it("every phone .pbtn is at least 44px tall", () => {
    expect(px(rule(".desktop .win .pbtn"), "min-height")).toBeGreaterThanOrEqual(44);
  });
});
