import type { WinId } from "./types";

export type WinState = {
  open: WinId[];
  z: Partial<Record<WinId, number>>;
  pos: Partial<Record<WinId, { x: number; y: number }>>;
  nextZ: number;
  mode: "desktop" | "phone";
};

export type WinAction =
  | { type: "open"; id: WinId }
  | { type: "close"; id: WinId }
  | { type: "focus"; id: WinId }
  | {
      type: "move";
      id: WinId;
      x: number;
      y: number;
      viewport: { w: number; h: number };
      width: number;
    }
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
  return { ...s, z: { ...s.z, [id]: s.nextZ }, nextZ: s.nextZ + 1 };
}

function openWin(s: WinState, id: WinId): WinState {
  const open = s.mode === "phone" ? [id] : s.open.includes(id) ? s.open : [...s.open, id];
  const z = s.mode === "phone" ? {} : s.z;
  return raise({ ...s, open, z }, id);
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
    case "move": {
      const x = Math.min(Math.max(a.x, KEEP_X - a.width), a.viewport.w - KEEP_X);
      const y = Math.min(Math.max(a.y, MENU_BAR), a.viewport.h - KEEP_Y);
      return { ...s, pos: { ...s.pos, [a.id]: { x, y } } };
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
