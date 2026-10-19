import { describe, expect, it } from "vitest";
import { toCell, WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/pixel/worldMap";

const at = (lat: number, lon: number) => {
  const { col, row } = toCell(lat, lon);
  return WORLD_ROWS_DATA[row][col];
};

describe("world map bitmap", () => {
  it("is 96 columns by 48 rows, every row exactly 96 characters", () => {
    expect(WORLD_COLS).toBe(96);
    expect(WORLD_ROWS).toBe(48);
    expect(WORLD_ROWS_DATA).toHaveLength(48);
    for (const row of WORLD_ROWS_DATA) expect(row).toHaveLength(96);
  });

  it("uses only land and sea characters, with both present", () => {
    const all = WORLD_ROWS_DATA.join("");
    expect(all).toMatch(/^[#.]+$/);
    expect(all).toContain("#");
    expect(all).toContain(".");
  });

  it("maps (0, 0) to the centre column and the equator row", () => {
    const { col, row } = toCell(0, 0);
    expect(Math.abs(col - WORLD_COLS / 2)).toBeLessThanOrEqual(1);
    // Rows run 84N to 60S, so the equator sits 84/144 of the way down.
    expect(row).toBe(Math.floor((84 / 144) * WORLD_ROWS));
  });

  it("clamps coordinates outside the drawn range into the grid", () => {
    expect(toCell(90, -180)).toEqual({ col: 0, row: 0 });
    expect(toCell(-90, 180)).toEqual({ col: WORLD_COLS - 1, row: WORLD_ROWS - 1 });
  });

  it("marks central Africa (5N, 20E) as land and the mid-Pacific (0, -150) as sea", () => {
    expect(at(5, 20)).toBe("#");
    expect(at(0, -150)).toBe(".");
  });

  it("gets a few more known cells right", () => {
    expect(at(51.5, -0.1)).toBe("#");
    expect(at(40, -100)).toBe("#");
    expect(at(-25, 135)).toBe("#");
    expect(at(30, -40)).toBe(".");
  });
});
