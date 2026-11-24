import { describe, expect, it } from "vitest";
import type { WinAction, WinState } from "@/lib/windows";
import {
  type Box,
  initialWindows,
  parentOf,
  placeWindow,
  topWindow,
  windowsReducer,
} from "@/lib/windows";

const run = (actions: WinAction[], start: WinState = initialWindows) =>
  actions.reduce(windowsReducer, start);

const viewport = { w: 1000, h: 800 };
// A title bar that starts 1px in (the window border) and is 298px wide.
const title = { titleLeft: 1, titleRight: 299 };

describe("windowsReducer", () => {
  it("open adds the id once and raises a reopened window above the rest", () => {
    const s = run([
      { type: "open", id: "projects" },
      { type: "open", id: "cv" },
      { type: "open", id: "projects" },
    ]);
    expect(s.open.filter((id) => id === "projects")).toHaveLength(1);
    expect(s.open).toHaveLength(2);
    expect(s.z.projects).toBeGreaterThan(s.z.cv as number);
  });

  it("focus raises z above all others; focusing a closed window does nothing", () => {
    const s = run([
      { type: "open", id: "projects" },
      { type: "open", id: "cv" },
      { type: "focus", id: "projects" },
    ]);
    expect(s.z.projects).toBeGreaterThan(s.z.cv as number);
    const after = windowsReducer(s, { type: "focus", id: "contact" });
    expect(after).toEqual(s);
  });

  it("close removes the window; closing a closed window is a no-op", () => {
    const s = run([
      { type: "open", id: "projects" },
      { type: "open", id: "cv" },
      { type: "close", id: "projects" },
    ]);
    expect(s.open).toEqual(["cv"]);
    expect(windowsReducer(s, { type: "close", id: "contact" })).toEqual(s);
  });

  it("move clamps all four corners and keeps 80px of the title bar visible", () => {
    const base = run([{ type: "open", id: "projects" }]);
    const at = (x: number, y: number) =>
      windowsReducer(base, { type: "move", id: "projects", x, y, viewport, ...title }).pos.projects;
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
      { type: "open", id: "projects" },
      { type: "move", id: "projects", x: 5000, y: 5000, viewport: big, ...title },
    ]);
    expect(s.pos.projects).toEqual({ x: big.w - 80 - title.titleLeft, y: big.h - 40 });
    const after = windowsReducer(s, {
      type: "clampAll",
      viewport: small,
      sizes: { projects: title },
    });
    const p = after.pos.projects as { x: number; y: number };
    expect(p.x + title.titleLeft).toBeLessThan(small.w);
    expect(small.w - (p.x + title.titleLeft)).toBe(80);
    expect(p.y).toBeLessThan(small.h);
    expect(p.y).toBe(small.h - 40);
  });

  it("clampAll leaves windows with no measured size alone", () => {
    const s = run([
      { type: "open", id: "projects" },
      { type: "move", id: "projects", x: 5000, y: 5000, viewport: { w: 1440, h: 900 }, ...title },
    ]);
    expect(windowsReducer(s, { type: "clampAll", viewport, sizes: {} }).pos).toEqual(s.pos);
  });

  it("renormalises z before it can reach the menu bar, keeping stacking order", () => {
    let s = run([
      { type: "open", id: "projects" },
      { type: "open", id: "cv" },
      { type: "open", id: "contact" },
    ]);
    for (let i = 0; i < 5000; i++) {
      s = windowsReducer(s, { type: "focus", id: i % 2 === 0 ? "projects" : "cv" });
    }
    const zs = Object.values(s.z) as number[];
    expect(Math.max(...zs)).toBeLessThan(4001);
    expect(s.nextZ).toBeLessThan(4002);
    expect(topWindow(s)).toBe("cv");
    expect(s.z.projects as number).toBeLessThan(s.z.cv as number);
    expect(s.z.contact as number).toBeLessThan(s.z.projects as number);
  });

  it("phone mode: open leaves exactly the new window open", () => {
    const s = run([
      { type: "setMode", mode: "phone" },
      { type: "open", id: "projects" },
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
      { type: "open", id: "projects" },
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
      { type: "open", id: "projects" },
      { type: "open", id: "cv" },
      { type: "closeAll" },
    ]);
    expect(s.open).toEqual([]);
    expect(topWindow(s)).toBeNull();
  });
});

describe("helpers", () => {
  it("parentOf maps project windows to projects, others to null", () => {
    expect(parentOf("project:delulu")).toBe("projects");
    expect(parentOf("cv")).toBeNull();
    expect(parentOf("projects")).toBeNull();
  });

  it("parentOf maps a browser window back to its About window", () => {
    expect(parentOf("browser:trip")).toBe("project:trip");
    expect(parentOf("browser:delulu")).toBe("project:delulu");
  });

  it("phone mode: closing a browser window goes back to its About window, then to projects", () => {
    let s = run([
      { type: "setMode", mode: "phone" },
      { type: "open", id: "browser:trip" },
      { type: "close", id: "browser:trip" },
    ]);
    expect(s.open).toEqual(["project:trip"]);
    s = windowsReducer(s, { type: "close", id: "project:trip" });
    expect(s.open).toEqual(["projects"]);
  });

  it("parentOf maps instrument windows and the Garage player to the Music folder", () => {
    expect(parentOf("music:guitar")).toBe("music");
    expect(parentOf("music:piano")).toBe("music");
    expect(parentOf("music:ukulele")).toBe("music");
    expect(parentOf("garage")).toBe("music");
    expect(parentOf("music")).toBeNull();
  });

  it("initialWindows is empty desktop with nextZ 10", () => {
    expect(initialWindows).toEqual({ open: [], z: {}, pos: {}, nextZ: 10, mode: "desktop" });
  });
});

describe("place", () => {
  const vp = { w: 1280, h: 720 };

  it("clamps the whole window into the viewport and caps the body so it ends above the bottom", () => {
    const at = (x: number, y: number, h: number) =>
      windowsReducer(initialWindows, {
        type: "place",
        id: "contact",
        x,
        y,
        w: 360,
        h,
        chrome: 40,
        viewport: vp,
      });
    const low = at(1200, 700, 200);
    expect(low.pos.contact).toEqual({ x: vp.w - 360, y: vp.h - 8 - 200 });
    expect(at(-50, -50, 200).pos.contact).toEqual({ x: 0, y: 30 });
    expect(at(10, 100, 200).cap?.contact).toBe(vp.h - 8 - 100 - 40);
  });

  it("a window taller than the screen sits under the menu bar and its body is capped to fit", () => {
    const s = windowsReducer(initialWindows, {
      type: "place",
      id: "cv",
      x: 0,
      y: 400,
      w: 640,
      h: 2000,
      chrome: 40,
      viewport: vp,
    });
    expect(s.pos.cv?.y).toBe(30);
    expect(s.cap?.cv).toBe(vp.h - 8 - 30 - 40);
  });

  it("does not change move: the title-bar clamp still lets a window hang off the bottom", () => {
    const s = windowsReducer(initialWindows, {
      type: "move",
      id: "cv",
      x: 0,
      y: 5000,
      viewport: vp,
      ...title,
    });
    expect(s.pos.cv?.y).toBe(vp.h - 40);
  });
});

describe("placeWindow", () => {
  const sizes = [
    { w: 1280, h: 720 },
    { w: 1366, h: 768 },
    { w: 1440, h: 900 },
    { w: 1920, h: 1080 },
  ];
  // The icons are one column at the right edge, or two when the screen is short.
  const oneColumn = (v: { w: number; h: number }): Box => ({ x: v.w - 100, y: 30, w: 92, h: 600 });
  const twoColumns = (v: { w: number; h: number }): Box => ({
    x: v.w - 196,
    y: 30,
    w: 188,
    h: 600,
  });
  const sized = { w: 640, h: 500 };

  it("keeps a window whole on screen, below the menu bar and left of the icons, at every size", () => {
    for (const s of sizes) {
      for (const icons of [oneColumn(s), twoColumns(s)]) {
        for (const id of ["cv", "youtube", "contact", "garage", "note", "photos"] as const) {
          const size = id === "note" ? { w: 230, h: 160 } : sized;
          const at = placeWindow(id, { w: s.w, h: s.h }, size, [], icons);
          expect(at.x, `${id} ${s.w}x${s.h}`).toBeGreaterThanOrEqual(0);
          expect(at.x + size.w, `${id} ${s.w}x${s.h}`).toBeLessThanOrEqual(icons.x);
          expect(at.y, `${id} ${s.w}x${s.h}`).toBeGreaterThanOrEqual(24);
          expect(at.y + size.h, `${id} ${s.w}x${s.h}`).toBeLessThanOrEqual(s.h - 8);
        }
      }
    }
  });

  it("moves left when the icons wrap to a second column", () => {
    const v = { w: 1280, h: 720 };
    const one = placeWindow("cv", v, sized, [], oneColumn(v));
    const two = placeWindow("cv", v, sized, [], twoColumns(v));
    expect(two.x).toBe(one.x - 96);
  });

  it("puts the note in the lowest corner left of the icons", () => {
    const v = { w: 1280, h: 720 };
    const note = { w: 230, h: 160 };
    const at = placeWindow("note", v, note, [], twoColumns(v));
    expect(at.y + note.h).toBe(v.h - 8);
    expect(at.x + note.w).toBe(twoColumns(v).x - 8);
  });

  it("never buries an older title bar", () => {
    const v = { w: 1280, h: 720 };
    const older: Box = { x: 8, y: 30, w: 370, h: 400 };
    const at = placeWindow("photos", v, { w: 370, h: 400 }, [older], oneColumn(v));
    const newer: Box = { ...at, w: 370, h: 400 };
    const overlapsBar = newer.y < older.y + 22 && newer.y + newer.h > older.y;
    const covered = overlapsBar
      ? Math.min(older.x + older.w, newer.x + newer.w) - Math.max(older.x, newer.x)
      : 0;
    expect(older.w - Math.max(0, covered)).toBeGreaterThanOrEqual(80);
  });

  it("works with no icons box and a window too wide for the free area", () => {
    const at = placeWindow("youtube", { w: 700, h: 500 }, { w: 620, h: 300 }, [], null);
    expect(at.x).toBeGreaterThanOrEqual(8);
    expect(at.x + 620).toBeLessThanOrEqual(700);
  });
});
