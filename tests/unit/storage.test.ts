// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("storage", () => {
  it("falls back when getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error();
    });
    expect(readJSON("k", 5)).toBe(5);
  });

  it("falls back on invalid JSON", () => {
    localStorage.setItem("k", "{nope");
    expect(readJSON("k", "fb")).toBe("fb");
  });

  it("falls back when absent", () => {
    expect(readJSON("missing", [1])).toEqual([1]);
  });

  it("round-trips a written value", () => {
    writeJSON("k", { a: [1, 2] });
    expect(readJSON("k", null)).toEqual({ a: [1, 2] });
  });

  it("writeJSON does not throw when setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error();
    });
    expect(() => writeJSON("k", 1)).not.toThrow();
  });

  it("removeKey does not throw when removeItem throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error();
    });
    expect(() => removeKey("k")).not.toThrow();
  });

  it("removeKey removes", () => {
    writeJSON("k", 1);
    removeKey("k");
    expect(readJSON("k", "gone")).toBe("gone");
  });
});
