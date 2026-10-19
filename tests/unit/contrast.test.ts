import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { contrastRatio, pickInk } from "@/lib/contrast";

const SWATCHES = copy.setup.swatches.map((s) => s.hex);

describe("contrast", () => {
  it("white on black is 21", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 2);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#3d6fb6", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#3d6fb6"),
      10,
    );
  });

  it.each(SWATCHES)("pickInk on %s gives the higher-contrast ink at >= 4.5", (bg) => {
    const ink = pickInk(bg);
    const other = ink === "#ffffff" ? "#111111" : "#ffffff";
    const ratio = contrastRatio(ink, bg);
    expect(ratio).toBeGreaterThanOrEqual(contrastRatio(other, bg));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
