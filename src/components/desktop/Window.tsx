"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { parentOf, topWindow } from "@/lib/windows";
import { useDesktop } from "./Desktop";
import { measureTitle } from "./titleMetrics";

type Placement = { left: number | string; top: number | string; width: number };

// From the approved mockup. Percentages are resolved to pixels the first time a window opens.
const PLACEMENT: Record<string, Placement> = {
  // The landing set (copy.firstWindows), laid out at 1440x900 as percentages so every title bar
  // stays reachable at smaller sizes (layout.spec checks). Back to front: see copy.ts LANDING.
  cv: { left: "48.6%", top: 40, width: 640 },
  note: { left: "76%", top: "71%", width: 230 },
  projects: { left: "28.5%", top: "75%", width: 370 },
  contact: { left: "36%", top: "28%", width: 360 },
  trash: { left: "46%", top: "22%", width: 390 },
  cvbuilder: { left: 16, top: 40, width: 560 },
  music: { left: 260, top: 100, width: 360 },
  "music:guitar": { left: 300, top: 130, width: 340 },
  "music:piano": { left: 330, top: 150, width: 340 },
  "music:ukulele": { left: 360, top: 170, width: 340 },
  garage: { left: 16, top: "68%", width: 380 },
  photos: { left: "23%", top: 70, width: 370 },
  youtube: { left: "50%", top: "76%", width: 620 },
  "project:delulu": { left: 150, top: 70, width: 400 },
  "project:trip": { left: 110, top: 70, width: 400 },
  // Below the About window that opens them, so the button that was pressed stays visible.
  "browser:delulu": { left: 150, top: 200, width: 680 },
  "browser:trip": { left: 110, top: 200, width: 680 },
};
const FALLBACK: Placement = { left: 120, top: 80, width: 420 };

export function Window({
  id,
  title,
  children,
}: {
  id: WinId;
  title: string;
  children?: ReactNode;
}) {
  const { state, dispatch, close, focus } = useDesktop();
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const isOpen = state.open.includes(id);
  const isFront = isOpen && topWindow(state) === id;
  const phone = state.mode === "phone";
  const place = PLACEMENT[id] ?? FALLBACK;
  const pos = state.pos[id];
  // On a phone the close box is the only way out, so it says where it goes.
  const closeLabel = parentOf(id) ? copy.chrome.back : copy.chrome.closeLabel;

  // On every desktop open, not only the first: turn the default (possibly percentage) position into
  // a clamped pixel one, as the mockup's openWin does. This also rescues a window whose stored
  // position no longer fits the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!isOpen || phone || !el) return;
    const r = el.getBoundingClientRect();
    dispatch({
      type: "move",
      id,
      x: Math.min(Math.max(0, r.left), Math.max(0, window.innerWidth - r.width)),
      y: r.top,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      ...measureTitle(el),
    });
  }, [isOpen, phone, id, dispatch]);

  const raise = () => {
    if (!isFront) focus(id);
  };

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || phone || (e.target as HTMLElement).closest("button")) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    dispatch({
      type: "move",
      id,
      x: e.clientX - d.dx,
      y: e.clientY - d.dy,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      ...measureTitle(el),
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <section
      ref={ref}
      className={isFront ? "win bevel front" : "win bevel"}
      aria-label={title}
      data-win={id}
      hidden={!isOpen}
      style={
        phone
          ? { zIndex: state.z[id] }
          : {
              left: pos?.x ?? place.left,
              top: pos?.y ?? place.top,
              width: place.width,
              zIndex: state.z[id],
            }
      }
      onPointerDown={raise}
      onFocusCapture={raise}
    >
      <div
        className="titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <button
          type="button"
          className="close"
          aria-label={phone ? closeLabel : copy.chrome.close}
          onClick={() => close(id)}
        >
          <span className="close-label" aria-hidden="true">
            {closeLabel}
          </span>
        </button>
        <span className="t">{title}</span>
        <span className="zoom" aria-hidden="true" />
        <span className="shade" aria-hidden="true" />
      </div>
      <div className="body well">{children}</div>
    </section>
  );
}
