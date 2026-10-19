"use client";

import { useEffect, useRef, useState } from "react";
import { type Place, travel } from "@/content/travel";
import { PALETTE } from "@/lib/pixel/icons";
import { toCell, WORLD_COLS, WORLD_ROWS, WORLD_ROWS_DATA } from "@/lib/pixel/worldMap";
import { PixelPin } from "./travel/PixelPin";
import "@/styles/travel.css";

// Each row's runs of land merged into one rectangle apiece, drawn as a single path.
const LAND_PATH = WORLD_ROWS_DATA.flatMap((line, y) =>
  [...line.matchAll(/#+/g)].map((m) => `M${m.index} ${y}h${m[0].length}v1h-${m[0].length}z`),
).join("");

export function TravelWindow({ places = travel.places }: { places?: Place[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const noteRef = useRef<HTMLDivElement>(null);
  const open = openIndex === null ? undefined : places[openIndex];

  useEffect(() => {
    if (openIndex !== null) noteRef.current?.focus();
  }, [openIndex]);

  const close = () => {
    const was = openIndex;
    setOpenIndex(null);
    if (was !== null) pinRefs.current[was]?.focus();
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: only catches Escape bubbling up from the pins and note
    <div
      className="travel"
      onKeyDown={(e) => {
        if (e.key === "Escape" && openIndex !== null) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <div className="travel-map">
        <svg
          className="land"
          viewBox={`0 0 ${WORLD_COLS} ${WORLD_ROWS}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={travel.ui.mapLabel}
          focusable="false"
        >
          <path d={LAND_PATH} fill={PALETTE.l} />
        </svg>
        {places.map((p, i) => {
          const { col, row } = toCell(p.lat, p.lon);
          return (
            <button
              type="button"
              key={`${p.name}-${p.lat}-${p.lon}`}
              ref={(el) => {
                pinRefs.current[i] = el;
              }}
              className="travel-pin"
              style={{
                left: `${((col + 0.5) / WORLD_COLS) * 100}%`,
                top: `${((row + 0.5) / WORLD_ROWS) * 100}%`,
              }}
              aria-label={p.name}
              aria-haspopup="dialog"
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <PixelPin />
            </button>
          );
        })}
      </div>
      <div className="travel-slot">
        {open ? (
          <div
            className="travel-note"
            role="dialog"
            aria-label={open.name}
            tabIndex={-1}
            ref={noteRef}
          >
            <div className="travel-note-bar">
              <button
                type="button"
                className="travel-note-close"
                aria-label={travel.ui.closeNote}
                onClick={close}
              />
              <h4>{open.name}</h4>
            </div>
            <p>{open.opinion}</p>
          </div>
        ) : (
          <p className="travel-hint">{places.length > 0 ? travel.ui.hint : travel.ui.empty}</p>
        )}
      </div>
    </div>
  );
}
