import { useEffect, useRef } from "react";
import { photos } from "@/content/photos";
import type { PhotoAlbum } from "./types";

type Props = {
  album: PhotoAlbum;
  onOpen(i: number): void;
  onBack(): void;
  /** The photo just closed in the viewer, so its thumbnail takes focus again. */
  focusIndex: number | null;
};

const ui = photos.ui;
// A phone row is three wide; the laptop's first row is longer, but these are certainly on screen.
const EAGER = 3;

// A Photos-app grid: square crops with tight gaps, every photo one button.
export function AlbumGrid({ album, onOpen, onBack, focusIndex }: Props) {
  const back = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  // Opening an album unmounts the tile that held focus, which would leave it on the body.
  useEffect(() => {
    const target =
      focusIndex === null ? null : grid.current?.querySelectorAll("button")[focusIndex];
    if (target) target.focus();
    else if (!document.activeElement || document.activeElement === document.body)
      back.current?.focus();
  }, [focusIndex]);

  return (
    <div className="photo-view">
      <div className="scrap-toolbar">
        <button type="button" className="pbtn photo-back" ref={back} onClick={onBack}>
          {ui.back}
        </button>
        <h3 className="photo-album-name">{album.title}</h3>
      </div>
      <div className="photo-grid" ref={grid}>
        {album.items.map((item, i) => (
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
    </div>
  );
}
