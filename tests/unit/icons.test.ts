import { describe, expect, it } from "vitest";
import { ICONS, PALETTE } from "@/lib/pixel/icons";
import type { IconName } from "@/lib/types";

const NAMES: IconName[] = [
  "happymac",
  "mac",
  "doc",
  "folder",
  "mail",
  "heart",
  "trash",
  "palette",
  "palm",
  "film",
  "gift",
  "passport",
  "satellite",
  "person",
  "apple",
  "caution",
  "note",
  "bomb",
];

describe("pixel icons", () => {
  it("has a bitmap for every IconName and no extras", () => {
    expect(Object.keys(ICONS).sort()).toEqual([...NAMES].sort());
  });

  for (const name of NAMES) {
    it(`${name} is 16 rows of 16 palette chars`, () => {
      const rows = ICONS[name];
      expect(rows).toHaveLength(16);
      for (const row of rows) {
        expect(row).toHaveLength(16);
        for (const ch of row) expect(ch === "." || ch in PALETTE).toBe(true);
      }
    });
  }
});
