"use client";

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from "react";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { type Box, parentOf, placeWindow, topWindow } from "@/lib/windows";
import { useDesktop } from "./Desktop";
import { measureTitle } from "./titleMetrics";

// Widths from the approved mockup. Where a window sits comes from placeWindow, not from here.
const WIDTH: Record<string, number> = {
  cv: 640,
  note: 230,
  projects: 370,
  contact: 360,
  trash: 390,
  cvbuilder: 560,
  music: 360,
  "music:guitar": 340,
  "music:piano": 340,
  "music:ukulele": 340,
  garage: 380,
  photos: 370,
  youtube: 620,
  "project:delulu": 400,
  "project:trip": 400,
  "browser:delulu": 680,
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
    if (!isOpen || phone || !el) return;
    const s = latest.current;
    const viewport = { w: window.innerWidth, h: window.innerHeight };
    const natural = (section: HTMLElement) => {
      const prev = section.style.getPropertyValue("--body-max");
      section.style.setProperty("--body-max", "none");
      const r = section.getBoundingClientRect();
      const body = section.querySelector<HTMLElement>(".body");
      const chrome = r.height - (body?.getBoundingClientRect().height ?? 0);
      if (prev) section.style.setProperty("--body-max", prev);
      else section.style.removeProperty("--body-max");
      return { w: r.width, h: r.height, chrome };
    };
    const me = natural(el);
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
        const size = known ? { w: r.width, h: r.height } : natural(section);
        const spot = known ?? placeWindow(other, viewport, size, boxes, iconsBox);
        boxes.push({ x: spot.x, y: spot.y, w: size.w, h: size.h });
      }
      at = placeWindow(id, viewport, me, boxes, iconsBox);
    }
    dispatch({ type: "place", id, x: at.x, y: at.y, ...me, viewport });
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
          : ({
              left: pos?.x ?? 0,
              top: pos?.y ?? 0,
              width,
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
        <span className="zoom" aria-hidden="true" />
        <span className="shade" aria-hidden="true" />
      </div>
      <div className="body well">{children}</div>
    </section>
  );
}
