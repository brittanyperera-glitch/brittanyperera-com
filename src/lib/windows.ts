import type { WinId } from "./types";

export type WinState = {
  open: WinId[];
  z: Partial<Record<WinId, number>>;
  pos: Partial<Record<WinId, { x: number; y: number }>>;
  /** Tallest the body may be, in px, so the whole window ends above the bottom edge. Set by `place`. */
  cap?: Partial<Record<WinId, number>>;
  /** A zoomed window's box before it was zoomed: where it was, and its natural size. */
  zoomed?: Partial<Record<WinId, { x: number; y: number; w: number; h: number; chrome: number }>>;
  /** Windows rolled up to their title bar. */
  shaded?: Partial<Record<WinId, true>>;
  nextZ: number;
  mode: "desktop" | "phone";
};

/** Title bar extent measured from the window's left border edge (see titleMetrics.ts). */
export type TitleMetrics = { titleLeft: number; titleRight: number };

type Viewport = { w: number; h: number };

/** A window or the icon area, in viewport pixels. */
export type Box = { x: number; y: number; w: number; h: number; id?: WinId };

export type WinAction =
  | { type: "open"; id: WinId }
  | { type: "close"; id: WinId }
  | { type: "focus"; id: WinId }
  | ({ type: "move"; id: WinId; x: number; y: number; viewport: Viewport } & TitleMetrics)
  | {
      type: "place";
      id: WinId;
      x: number;
      y: number;
      /** The window's natural size, and the part of its height that is not body. */
      w: number;
      h: number;
      chrome: number;
      viewport: Viewport;
    }
  | {
      type: "refit";
      viewport: Viewport;
      sizes: Partial<Record<WinId, { w: number; h: number; chrome: number }>>;
    }
  | {
      type: "zoom";
      id: WinId;
      /** The window's natural size before zooming; used to put it back. */
      w: number;
      h: number;
      chrome: number;
      viewport: Viewport;
    }
  | { type: "shade"; id: WinId }
  | { type: "clampAll"; viewport: Viewport; sizes: Partial<Record<WinId, TitleMetrics>> }
  | { type: "closeAll" }
  | { type: "setMode"; mode: WinState["mode"] };

export const initialWindows: WinState = {
  open: [],
  z: {},
  pos: {},
  nextZ: 10,
  mode: "desktop",
};

export const MENU_BAR = 24;
const KEEP_X = 80;
const KEEP_Y = 40;
// Clear space kept around placed windows, and the least body a capped window still shows.
const PAD = 8;
const TOP = MENU_BAR + 6;
const MIN_BODY = 96;
// A window opened on top must leave this much of every older title bar showing, or it cannot be grabbed.
const TITLE_H = 22;
const MIN_TITLE = 80;
const STEP = 16;
const OVERLAP_PX = 60;
// The Stickies note is there to be read, so sitting on it costs more than sitting on other windows.
const NOTE_WEIGHT = 4;
const BURY_PX = 20;
// Window z must stay below the menu bar (5000); renormalise well before it gets there.
const Z_BASE = 10;
const Z_CEILING = 4000;

export function parentOf(id: WinId): WinId | null {
  if (id.startsWith("project:")) return "projects";
  if (id.startsWith("browser:")) return `project:${id.slice("browser:".length)}` as WinId;
  if (id === "garage") return "music";
  return null;
}

export function topWindow(s: WinState): WinId | null {
  let top: WinId | null = null;
  let best = Number.NEGATIVE_INFINITY;
  for (const id of s.open) {
    const z = s.z[id] ?? 0;
    if (z >= best) {
      best = z;
      top = id;
    }
  }
  return top;
}

function raise(s: WinState, id: WinId): WinState {
  const raised = { ...s, z: { ...s.z, [id]: s.nextZ }, nextZ: s.nextZ + 1 };
  if (raised.nextZ <= Z_CEILING) return raised;
  const ranked = (Object.entries(raised.z) as [WinId, number][]).sort((a, b) => a[1] - b[1]);
  const z: WinState["z"] = {};
  ranked.forEach(([wid], i) => {
    z[wid] = Z_BASE + i;
  });
  return { ...raised, z, nextZ: Z_BASE + ranked.length };
}

function openWin(s: WinState, id: WinId): WinState {
  const open = s.mode === "phone" ? [id] : s.open.includes(id) ? s.open : [...s.open, id];
  const z = s.mode === "phone" ? {} : s.z;
  return raise({ ...s, open, z }, id);
}

// Keeps KEEP_X px of the TITLE BAR (not the whole section) on screen, below the menu bar.
function clampPos(x: number, y: number, viewport: Viewport, t: TitleMetrics) {
  return {
    x: Math.min(Math.max(x, KEEP_X - t.titleRight), viewport.w - KEEP_X - t.titleLeft),
    y: Math.min(Math.max(y, MENU_BAR), viewport.h - KEEP_Y),
  };
}

type Anchor = { fx: number; fy: number };
const DEFAULT_ANCHOR: Anchor = { fx: 0.1, fy: 0.1 };
// Where each window likes to sit in the free area (0 = left/top edge, 1 = right/bottom edge), taken
// from the 1440x900 mockup. placeWindow turns these into pixels for whatever screen it gets.
const ANCHORS: Partial<Record<WinId, Anchor>> = {
  cv: { fx: 1, fy: 0 },
  note: { fx: 1, fy: 1 },
  projects: { fx: 0.3, fy: 1 },
  contact: { fx: 0.25, fy: 1 },
  trash: { fx: 0.5, fy: 0.2 },
  cvbuilder: { fx: 0, fy: 0 },
  music: { fx: 0.15, fy: 0.1 },
  garage: { fx: 0, fy: 1 },
  photos: { fx: 0, fy: 0 },
  youtube: { fx: 0.3, fy: 1 },
  truths: { fx: 0.4, fy: 0.5 },
  "project:delulu": { fx: 0.15, fy: 0.05 },
  "project:trip": { fx: 0.1, fy: 0.05 },
  // Below the About window that opens them, so the button that was pressed stays visible.
  "browser:trip": { fx: 0.1, fy: 0.3 },
};

function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

// How much of o's title bar the later boxes leave showing.
function titleShowing(o: Box, later: Box[]): number {
  const spans = later
    .filter((c) => c.y < o.y + TITLE_H && c.y + c.h > o.y)
    .map((c) => [Math.max(c.x, o.x), Math.min(c.x + c.w, o.x + o.w)] as const)
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  let covered = 0;
  let end = Number.NEGATIVE_INFINITY;
  for (const [a, b] of spans) {
    covered += Math.max(0, b - Math.max(a, end));
    end = Math.max(end, b);
  }
  return o.w - covered;
}

/**
 * Where a newly opened window goes. It stays left of the icons and fully on screen, prefers its
 * anchor, avoids sitting on other windows, and never buries more of an older title bar than the
 * minimum. openBoxes are the windows already open, oldest first.
 */
export function placeWindow(
  id: WinId,
  viewport: Viewport,
  size: { w: number; h: number },
  openBoxes: Box[],
  iconsBox: Box | null,
): { x: number; y: number } {
  const anchor = ANCHORS[id] ?? DEFAULT_ANCHOR;
  const right = Math.min(viewport.w - PAD, iconsBox ? iconsBox.x - PAD : viewport.w);
  const xHi = right - size.w >= PAD ? right - size.w : Math.max(PAD, viewport.w - PAD - size.w);
  const h = Math.min(size.h, viewport.h - PAD - TOP);
  const yHi = Math.max(TOP, viewport.h - PAD - h);
  const px = Math.round(PAD + anchor.fx * (xHi - PAD));
  const py = Math.round(TOP + anchor.fy * (yHi - TOP));

  const axis = (lo: number, hi: number, pref: number) => {
    const out = new Set([pref, hi, lo]);
    for (let v = lo; v < hi; v += STEP) out.add(v);
    return [...out];
  };
  let best = { x: px, y: py };
  let bestCost = Number.POSITIVE_INFINITY;
  for (const x of axis(PAD, xHi, px)) {
    for (const y of axis(TOP, yHi, py)) {
      const box = { x, y, w: size.w, h };
      // Burying an older title bar below the minimum is allowed only when nothing else fits, so it
      // costs far more than moving.
      const buried = openBoxes.reduce((sum, o, i) => {
        const after = openBoxes.slice(i + 1);
        const want = Math.min(MIN_TITLE, titleShowing(o, after));
        return sum + Math.max(0, want - titleShowing(o, [...after, box]));
      }, 0);
      const cost =
        Math.abs(x - px) +
        Math.abs(y - py) +
        buried * BURY_PX +
        openBoxes.reduce(
          (sum, o) => sum + overlapArea(o, box) * (o.id === "note" ? NOTE_WEIGHT : 1),
          0,
        ) /
          OVERLAP_PX;
      if (cost < bestCost) {
        bestCost = cost;
        best = { x, y };
      }
    }
  }
  return best;
}

// The whole window inside the viewport when it fits, and a body cap so it ends above the bottom edge.
function fitWindow(
  a: { x: number; y: number; w: number; h: number; chrome: number },
  v: Viewport,
): { pos: { x: number; y: number }; cap: number } {
  const maxX = v.w - a.w;
  const maxY = v.h - PAD - a.h;
  const x = maxX >= 0 ? Math.min(Math.max(a.x, 0), maxX) : 0;
  const y = maxY >= TOP ? Math.min(Math.max(a.y, TOP), maxY) : TOP;
  return { pos: { x, y }, cap: Math.max(MIN_BODY, v.h - PAD - y - a.chrome) };
}

// Puts a zoomed window back in the box it had, fitted to the current viewport. Without a viewport
// (the window is closing) the saved position is enough: it is fitted again when it next opens.
function unzoom(s: WinState, id: WinId, viewport?: Viewport): WinState {
  const prev = s.zoomed?.[id];
  if (!prev) return s;
  const { [id]: _zoomed, ...zoomed } = s.zoomed ?? {};
  if (!viewport) return { ...s, zoomed, pos: { ...s.pos, [id]: { x: prev.x, y: prev.y } } };
  const fit = fitWindow(prev, viewport);
  return { ...s, zoomed, pos: { ...s.pos, [id]: fit.pos }, cap: { ...s.cap, [id]: fit.cap } };
}

function unshade(s: WinState, id: WinId): WinState {
  if (!s.shaded?.[id]) return s;
  const { [id]: _shaded, ...shaded } = s.shaded;
  return { ...s, shaded };
}

// Every window back to its own box and unrolled: a phone, or no window open, has neither state.
function unrollAll(s: WinState): WinState {
  let next: WinState = { ...s, shaded: {} };
  for (const id of Object.keys(s.zoomed ?? {}) as WinId[]) next = unzoom(next, id);
  return next;
}

export function windowsReducer(s: WinState, a: WinAction): WinState {
  switch (a.type) {
    case "open":
      return openWin(s, a.id);
    case "focus":
      return s.open.includes(a.id) ? raise(s, a.id) : s;
    case "close": {
      if (!s.open.includes(a.id)) return s;
      const { [a.id]: _removed, ...z } = s.z;
      const restored = unshade(unzoom(s, a.id), a.id);
      const closed = { ...restored, open: restored.open.filter((id) => id !== a.id), z };
      const parent = parentOf(a.id);
      return s.mode === "phone" && parent ? openWin(closed, parent) : closed;
    }
    case "move":
      return { ...s, pos: { ...s.pos, [a.id]: clampPos(a.x, a.y, a.viewport, a) } };
    case "place": {
      const fit = fitWindow(a, a.viewport);
      return { ...s, pos: { ...s.pos, [a.id]: fit.pos }, cap: { ...s.cap, [a.id]: fit.cap } };
    }
    case "refit": {
      // The viewport changed under open windows: the `place` clamp again, from their natural sizes.
      let next = s;
      for (const id of s.open) {
        if (s.zoomed?.[id]) continue;
        const at = s.pos[id];
        const size = a.sizes[id];
        if (!at || !size) continue;
        const fit = fitWindow({ ...at, ...size }, a.viewport);
        next = {
          ...next,
          pos: { ...next.pos, [id]: fit.pos },
          cap: { ...next.cap, [id]: fit.cap },
        };
      }
      return next;
    }
    case "zoom": {
      if (s.zoomed?.[a.id]) return unzoom(s, a.id, a.viewport);
      const at = s.pos[a.id] ?? { x: 0, y: MENU_BAR };
      const open = unshade(s, a.id);
      return {
        ...open,
        zoomed: { ...open.zoomed, [a.id]: { ...at, w: a.w, h: a.h, chrome: a.chrome } },
        pos: { ...open.pos, [a.id]: { x: 0, y: MENU_BAR } },
      };
    }
    case "shade":
      return s.shaded?.[a.id] ? unshade(s, a.id) : { ...s, shaded: { ...s.shaded, [a.id]: true } };
    case "clampAll": {
      const pos = { ...s.pos };
      let changed = false;
      for (const [id, p] of Object.entries(s.pos) as [WinId, { x: number; y: number }][]) {
        const size = a.sizes[id];
        if (!size) continue;
        const next = clampPos(p.x, p.y, a.viewport, size);
        if (next.x !== p.x || next.y !== p.y) {
          pos[id] = next;
          changed = true;
        }
      }
      return changed ? { ...s, pos } : s;
    }
    case "closeAll":
      return { ...unrollAll(s), open: [], z: {} };
    case "setMode": {
      if (a.mode === s.mode) return s;
      if (a.mode === "desktop") return { ...s, mode: "desktop" };
      const top = topWindow(s);
      const open = top ? [top] : [];
      const z = top && s.z[top] !== undefined ? { [top]: s.z[top] } : {};
      return { ...unrollAll(s), mode: "phone", open, z };
    }
  }
}
