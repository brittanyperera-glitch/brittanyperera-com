import { describe, expect, it } from "vitest";
import type { WinAction, WinState } from "@/lib/windows";
import { initialWindows, parentOf, topWindow, windowsReducer } from "@/lib/windows";

const run = (actions: WinAction[], start: WinState = initialWindows) =>
  actions.reduce(windowsReducer, start);

const viewport = { w: 1000, h: 800 };
const width = 300;

describe("windowsReducer", () => {
  it("open adds the id once and raises a reopened window above the rest", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "open", id: "about" },
    ]);
    expect(s.open.filter((id) => id === "about")).toHaveLength(1);
    expect(s.open).toHaveLength(2);
    expect(s.z.about).toBeGreaterThan(s.z.cv as number);
  });

  it("focus raises z above all others; focusing a closed window does nothing", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "focus", id: "about" },
    ]);
    expect(s.z.about).toBeGreaterThan(s.z.cv as number);
    const after = windowsReducer(s, { type: "focus", id: "contact" });
    expect(after).toEqual(s);
  });

  it("close removes the window; closing a closed window is a no-op", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "close", id: "about" },
    ]);
    expect(s.open).toEqual(["cv"]);
    expect(windowsReducer(s, { type: "close", id: "contact" })).toEqual(s);
  });

  it("move clamps all four corners", () => {
    const base = run([{ type: "open", id: "about" }]);
    const at = (x: number, y: number) =>
      windowsReducer(base, { type: "move", id: "about", x, y, viewport, width }).pos.about;
    expect(at(-5000, -5000)).toEqual({ x: 80 - width, y: 24 });
    expect(at(5000, -5000)).toEqual({ x: viewport.w - 80, y: 24 });
    expect(at(-5000, 5000)).toEqual({ x: 80 - width, y: viewport.h - 40 });
    expect(at(5000, 5000)).toEqual({ x: viewport.w - 80, y: viewport.h - 40 });
    expect(at(100, 100)).toEqual({ x: 100, y: 100 });
  });

  it("phone mode: open leaves exactly the new window open", () => {
    const s = run([
      { type: "setMode", mode: "phone" },
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
    ]);
    expect(s.open).toEqual(["cv"]);
  });

  it("phone mode: closing project:trip opens projects; closing projects leaves nothing", () => {
    let s = run([
      { type: "setMode", mode: "phone" },
      { type: "open", id: "project:trip" },
      { type: "close", id: "project:trip" },
    ]);
    expect(s.open).toEqual(["projects"]);
    s = windowsReducer(s, { type: "close", id: "projects" });
    expect(s.open).toEqual([]);
  });

  it("setMode phone with several open keeps only the top window", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "open", id: "contact" },
      { type: "focus", id: "cv" },
      { type: "setMode", mode: "phone" },
    ]);
    expect(s.mode).toBe("phone");
    expect(s.open).toEqual(["cv"]);
  });

  it("closeAll empties open", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "closeAll" },
    ]);
    expect(s.open).toEqual([]);
    expect(topWindow(s)).toBeNull();
  });
});

describe("helpers", () => {
  it("parentOf maps project windows to projects, others to null", () => {
    expect(parentOf("project:gift")).toBe("projects");
    expect(parentOf("about")).toBeNull();
    expect(parentOf("projects")).toBeNull();
  });

  it("initialWindows is empty desktop with nextZ 10", () => {
    expect(initialWindows).toEqual({ open: [], z: {}, pos: {}, nextZ: 10, mode: "desktop" });
  });
});
