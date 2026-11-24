"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/components/setup/useFocusTrap";
import { copy } from "@/content/copy";
import "@/styles/phone-home.css";
import { useClock } from "./useClock";

// Matches the knob's left and top offset in phone-home.css.
const KNOB_INSET = 5;
// Close enough to the far end counts as all the way.
const SLACK_PX = 12;
// A press that travels less than this is a tap, not a drag.
const TAP_PX = 4;

/**
 * The lock a new visitor meets on a phone. The knob is a real button, so a tap or a screen reader
 * unlocks it; dragging it across is the same thing done the long way. `.setup` makes the no-JS
 * stylesheet hide it, as it does the laptop's overlays.
 */
export function PhoneLock({ onUnlock }: { onUnlock: () => void }) {
  const p = copy.phone.lock;
  const { time, date } = useClock();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLButtonElement>(null);
  const from = useRef<number | null>(null);
  const dragged = useRef(false);
  const [dx, setDx] = useState(0);

  useEffect(() => knob.current?.focus(), []);
  useFocusTrap(root);

  const reach = () =>
    (track.current?.clientWidth ?? 0) - (knob.current?.offsetWidth ?? 0) - KNOB_INSET * 2;

  return (
    <div
      ref={root}
      className="setup phone-lock"
      role="dialog"
      aria-modal="true"
      aria-label={p.label}
    >
      <div className="lock-top">
        <div className="lock-time">{time}</div>
        <div className="lock-date">{date}</div>
      </div>
      <div className="lock-mid">
        <div className="bubble">
          <p className="from">{p.from}</p>
          <p className="msg">{p.message}</p>
          <p className="hello-row">
            {copy.setup.hello.map((h) => (
              <span key={h.lang} lang={h.lang}>
                {h.text}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="lock-bottom">
        <div className="slider" ref={track}>
          <button
            ref={knob}
            type="button"
            className="knob"
            aria-label={p.slide}
            style={dx ? { transform: `translateX(${dx}px)` } : undefined}
            onPointerDown={(e) => {
              from.current = e.clientX;
              dragged.current = false;
              e.currentTarget.setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (from.current === null) return;
              const d = Math.max(0, Math.min(reach(), e.clientX - from.current));
              if (d > TAP_PX) dragged.current = true;
              setDx(d);
            }}
            onPointerUp={() => {
              if (from.current === null) return;
              from.current = null;
              if (dragged.current && dx >= reach() - SLACK_PX) onUnlock();
              setDx(0);
            }}
            onPointerCancel={() => {
              from.current = null;
              setDx(0);
            }}
            // A drag that stops short still ends in a click on the knob; that is not a tap.
            onClick={() => {
              if (!dragged.current) onUnlock();
              dragged.current = false;
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 12h13M12 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="shine" aria-hidden="true">
            {p.slide}
          </span>
        </div>
      </div>
    </div>
  );
}
