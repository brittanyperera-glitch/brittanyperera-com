import { describe, expect, it } from "vitest";
import type { WinAction, WinState } from "@/lib/windows";
import { initialWindows, parentOf, topWindow, windowsReducer } from "@/lib/windows";

const run = (actions: WinAction[], start: WinState = initialWindows) =>
  actions.reduce(windowsReducer, start);

const viewport = { w: 1000, h: 800 };
// A title bar that starts 1px in (the window border) and is 298px wide.
const title = { titleLeft: 1, titleRight: 299 };

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

  it("move clamps all four corners and keeps 80px of the title bar visible", () => {
    const base = run([{ type: "open", id: "about" }]);
    const at = (x: number, y: number) =>
      windowsReducer(base, { type: "move", id: "about", x, y, viewport, ...title }).pos.about;
    const left = at(-5000, -5000);
    const right = at(5000, 5000);
    expect(left).toEqual({ x: 80 - title.titleRight, y: 24 });
    expect(right).toEqual({ x: viewport.w - 80 - title.titleLeft, y: viewport.h - 40 });
    expect((left?.x ?? 0) + title.titleRight).toBe(80);
    expect(viewport.w - ((right?.x ?? 0) + title.titleLeft)).toBe(80);
    expect(at(-5000, 5000)).toEqual({ x: 80 - title.titleRight, y: viewport.h - 40 });
    expect(at(5000, -5000)).toEqual({ x: viewport.w - 80 - title.titleLeft, y: 24 });
    expect(at(100, 100)).toEqual({ x: 100, y: 100 });
  });

  it("clampAll pulls a window dragged to the bottom right back inside a smaller viewport", () => {
    const big = { w: 1440, h: 900 };
    const small = { w: 1024, h: 600 };
    const s = run([
      { type: "open", id: "about" },
      { type: "move", id: "about", x: 5000, y: 5000, viewport: big, ...title },
    ]);
    expect(s.pos.about).toEqual({ x: big.w - 80 - title.titleLeft, y: big.h - 40 });
    const after = windowsReducer(s, { type: "clampAll", viewport: small, sizes: { about: title } });
    const p = after.pos.about as { x: number; y: number };
    expect(p.x + title.titleLeft).toBeLessThan(small.w);
    expect(small.w - (p.x + title.titleLeft)).toBe(80);
    expect(p.y).toBeLessThan(small.h);
    expect(p.y).toBe(small.h - 40);
  });

  it("clampAll leaves windows with no measured size alone", () => {
    const s = run([
      { type: "open", id: "about" },
      { type: "move", id: "about", x: 5000, y: 5000, viewport: { w: 1440, h: 900 }, ...title },
    ]);
    expect(windowsReducer(s, { type: "clampAll", viewport, sizes: {} }).pos).toEqual(s.pos);
  });

  it("renormalises z before it can reach the menu bar, keeping stacking order", () => {
    let s = run([
      { type: "open", id: "about" },
      { type: "open", id: "cv" },
      { type: "open", id: "contact" },
    ]);
    for (let i = 0; i < 5000; i++) {
      s = windowsReducer(s, { type: "focus", id: i % 2 === 0 ? "about" : "cv" });
    }
    const zs = Object.values(s.z) as number[];
    expect(Math.max(...zs)).toBeLessThan(4001);
    expect(s.nextZ).toBeLessThan(4002);
    expect(topWindow(s)).toBe("cv");
    expect(s.z.about as number).toBeLessThan(s.z.cv as number);
    expect(s.z.contact as number).toBeLessThan(s.z.about as number);
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
