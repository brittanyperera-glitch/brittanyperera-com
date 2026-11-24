import { useEffect, useRef } from "react";
import { photos } from "@/content/photos";
import type { PhotoItem } from "./types";

type Props = {
  items: PhotoItem[];
  onOpen(i: number): void;
  /** The photo just closed in the viewer, so its thumbnail takes focus again. */
  focusIndex: number | null;
};

const ui = photos.ui;
// A phone row is three wide; the laptop's first row is longer, but these are certainly on screen.
const EAGER = 3;

const countLabel = (n: number) => (n === 1 ? ui.countOne : ui.countMany.replace("{n}", String(n)));

// A Photos-app library: square crops with tight gaps, every photo one button, the count underneath.
export function PhotoGrid({ items, onOpen, focusIndex }: Props) {
  const grid = useRef<HTMLDivElement>(null);

  // Opening a photo unmounts the thumbnail that held focus, which would leave it on the body.
  useEffect(() => {
    const target =
      focusIndex === null ? null : grid.current?.querySelectorAll("button")[focusIndex];
    if (target) target.focus();
  }, [focusIndex]);

  return (
    <div className="photo-view">
      <div className="photo-grid" ref={grid}>
        {items.map((item, i) => (
          <button key={item.src} type="button" className="photo-thumb" onClick={() => onOpen(i)}>
            {/* biome-ignore lint/performance/noImgElement: plain img by design, files are static */}
            <img
              src={item.src}
              alt={item.alt}
              width={240}
              height={240}
              loading={i < EAGER ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        ))}
      </div>
      <p className="photo-total">{countLabel(items.length)}</p>
    </div>
  );
}
