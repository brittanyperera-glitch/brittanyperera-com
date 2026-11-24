"use client";

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from "react";
import { copy } from "@/content/copy";
import { windowBox } from "@/content/windowbox";
import type { WinId } from "@/lib/types";
import { type Box, MENU_BAR, parentOf, placeWindow, topWindow } from "@/lib/windows";
import { useDesktop } from "./Desktop";
import { measureNatural, measureTitle } from "./titleMetrics";

// Widths from the approved mockup. Where a window sits comes from placeWindow, not from here.
const WIDTH: Record<string, number> = {
  cv: 640,
  note: 230,
  projects: 370,
  contact: 360,
  trash: 390,
  music: 360,
  garage: 380,
  photos: 370,
  youtube: 620,
  "project:delulu": 400,
  "project:trip": 400,
  "browser:trip": 680,
};
const FALLBACK_WIDTH = 420;

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
  const width = WIDTH[id] ?? FALLBACK_WIDTH;
  const pos = state.pos[id];
  const cap = state.cap?.[id];
  const zoomed = state.zoomed?.[id] !== undefined;
  const shaded = state.shaded?.[id] === true;
  // The effect below reads the open order and stored positions without re-running on every change.
  const latest = useRef(state);
  latest.current = state;
  // On a phone the close box is the only way out, so it says where it goes.
  const closeLabel = parentOf(id) ? copy.chrome.back : copy.chrome.closeLabel;

  // On every desktop open, before paint: measure the window at its natural height, then put it
  // wholly on screen. A first open is placed among the windows opened before it (a visitor's first
  // windows all open in one commit, so the ones not yet placed are placed here too, in open order).
  useLayoutEffect(() => {
    const el = ref.current;
    // Zoomed or rolled-up, a window has no natural size to measure; it is placed once it is neither.
    if (!isOpen || phone || zoomed || shaded || !el) return;
    const s = latest.current;
    const viewport = { w: window.innerWidth, h: window.innerHeight };
    const me = measureNatural(el);
    let at = s.pos[id];
    if (!at) {
      const icons = [...document.querySelectorAll<HTMLElement>(".icons .icon")].map((i) =>
        i.getBoundingClientRect(),
      );
      const left = Math.min(...icons.map((r) => r.left));
      const iconsBox: Box | null = icons.length
        ? {
            x: left,
            y: Math.min(...icons.map((r) => r.top)),
            w: Math.max(...icons.map((r) => r.right)) - left,
            h: Math.max(...icons.map((r) => r.bottom)) - Math.min(...icons.map((r) => r.top)),
          }
        : null;
      const boxes: Box[] = [];
      for (const other of s.open.slice(0, s.open.indexOf(id))) {
        const section = document.querySelector<HTMLElement>(`section[data-win="${other}"]`);
        if (!section) continue;
        const r = section.getBoundingClientRect();
        const known = s.pos[other];
        const size = known ? { w: r.width, h: r.height } : measureNatural(section);
        const spot = known ?? placeWindow(other, viewport, size, boxes, iconsBox);
        boxes.push({ x: spot.x, y: spot.y, w: size.w, h: size.h, id: other });
      }
      at = placeWindow(id, viewport, me, boxes, iconsBox);
    }
    dispatch({ type: "place", id, x: at.x, y: at.y, ...me, viewport });
  }, [isOpen, phone, zoomed, shaded, id, dispatch]);

  const raise = () => {
    if (!isFront) focus(id);
  };

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || phone || zoomed || (e.target as HTMLElement).closest("button")) return;
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

  const zoom = () => {
    const el = ref.current;
    if (!el) return;
    // A rolled-up window has no body to measure; the box it goes back to is the unrolled one.
    const body = el.querySelector<HTMLElement>(".body");
    if (body) body.hidden = false;
    const me = measureNatural(el);
    if (body) body.hidden = shaded;
    dispatch({
      type: "zoom",
      id,
      ...me,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <section
      ref={ref}
      className={[
        "win bevel",
        isFront && "front",
        !phone && zoomed && "zoomed",
        !phone && shaded && "shaded",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={title}
      data-win={id}
      hidden={!isOpen}
      style={
        phone
          ? { zIndex: state.z[id] }
          : ({
              left: pos?.x ?? 0,
              top: pos?.y ?? 0,
              width: zoomed ? "100vw" : width,
              ...(zoomed && !shaded ? { height: `calc(100vh - ${MENU_BAR}px)` } : {}),
              zIndex: state.z[id],
              ...(cap === undefined ? {} : { "--body-max": `${cap}px` }),
            } as CSSProperties)
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
        {phone ? null : (
          <>
            <button
              type="button"
              className="zoom"
              aria-label={zoomed ? windowBox.zoomBack : windowBox.zoom}
              onClick={zoom}
            />
            <button
              type="button"
              className="shade"
              aria-label={shaded ? windowBox.expand : windowBox.collapse}
              onClick={() => dispatch({ type: "shade", id })}
            />
          </>
        )}
      </div>
      <div className="body well" hidden={shaded && !phone}>
        {children}
      </div>
    </section>
  );
}
