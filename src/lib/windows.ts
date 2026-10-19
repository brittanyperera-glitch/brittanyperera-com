import type { WinId } from "./types";

export type WinState = {
  open: WinId[];
  z: Partial<Record<WinId, number>>;
  pos: Partial<Record<WinId, { x: number; y: number }>>;
  nextZ: number;
  mode: "desktop" | "phone";
};

/** Title bar extent measured from the window's left border edge (see titleMetrics.ts). */
export type TitleMetrics = { titleLeft: number; titleRight: number };

type Viewport = { w: number; h: number };

export type WinAction =
  | { type: "open"; id: WinId }
  | { type: "close"; id: WinId }
  | { type: "focus"; id: WinId }
  | ({ type: "move"; id: WinId; x: number; y: number; viewport: Viewport } & TitleMetrics)
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

const MENU_BAR = 24;
const KEEP_X = 80;
const KEEP_Y = 40;
// Window z must stay below the menu bar (5000); renormalise well before it gets there.
const Z_BASE = 10;
const Z_CEILING = 4000;

export function parentOf(id: WinId): WinId | null {
  return id.startsWith("project:") ? "projects" : null;
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

export function windowsReducer(s: WinState, a: WinAction): WinState {
  switch (a.type) {
    case "open":
      return openWin(s, a.id);
    case "focus":
      return s.open.includes(a.id) ? raise(s, a.id) : s;
    case "close": {
      if (!s.open.includes(a.id)) return s;
      const { [a.id]: _removed, ...z } = s.z;
      const closed = { ...s, open: s.open.filter((id) => id !== a.id), z };
      const parent = parentOf(a.id);
      return s.mode === "phone" && parent ? openWin(closed, parent) : closed;
    }
    case "move":
      return { ...s, pos: { ...s.pos, [a.id]: clampPos(a.x, a.y, a.viewport, a) } };
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
      return { ...s, open: [], z: {} };
    case "setMode": {
      if (a.mode === s.mode) return s;
      if (a.mode === "desktop") return { ...s, mode: "desktop" };
      const top = topWindow(s);
      const open = top ? [top] : [];
      const z = top && s.z[top] !== undefined ? { [top]: s.z[top] } : {};
      return { ...s, mode: "phone", open, z };
    }
  }
}
