"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { topWindow } from "@/lib/windows";
import { useDesktop } from "./Desktop";

type Placement = { left: number | string; top: number | string; width: number };

// From the approved mockup. Percentages are resolved to pixels the first time a window opens.
const PLACEMENT: Record<string, Placement> = {
  about: { left: 30, top: 40, width: 490 },
  cv: { left: 540, top: 60, width: 380 },
  projects: { left: 300, top: 110, width: 370 },
  contact: { left: "36%", top: "28%", width: 360 },
  trash: { left: "46%", top: "22%", width: 390 },
  "project:trip": { left: 110, top: 70, width: 500 },
  "project:delulu": { left: 150, top: 90, width: 450 },
  "project:whereflix": { left: 190, top: 110, width: 430 },
  "project:gift": { left: 230, top: 130, width: 430 },
  "project:schengen": { left: 270, top: 150, width: 410 },
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

  // First open on desktop: turn the default (possibly percentage) position into a clamped pixel one.
  const placed = pos !== undefined;
  useEffect(() => {
    const el = ref.current;
    if (!isOpen || placed || phone || !el) return;
    const r = el.getBoundingClientRect();
    dispatch({
      type: "move",
      id,
      x: Math.min(Math.max(0, r.left), Math.max(0, window.innerWidth - r.width)),
      y: r.top,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      width: el.offsetWidth,
    });
  }, [isOpen, placed, phone, id, dispatch]);

  const raise = () => {
    if (!isFront) focus(id);
  };

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phone || (e.target as HTMLElement).closest("button")) return;
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
      width: el.offsetWidth,
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
      hidden={!isOpen}
      style={{
        left: pos?.x ?? place.left,
        top: pos?.y ?? place.top,
        width: place.width,
        zIndex: state.z[id],
      }}
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
          aria-label={copy.chrome.close}
          onClick={() => close(id)}
        />
        <span className="t">{title}</span>
        <span className="zoom" aria-hidden="true" />
      </div>
      <div className="body well">{children}</div>
    </section>
  );
}
