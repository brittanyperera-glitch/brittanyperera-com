import { useEffect, useRef } from "react";
import { photos } from "@/content/photos";
import type { PhotoAlbum } from "./types";

type Props = {
  albums: PhotoAlbum[];
  onOpen(id: string): void;
  /** The album just closed, so its tile takes focus again. */
  focusId: string | null;
};

const ui = photos.ui;

const countLabel = (n: number) => (n === 1 ? ui.countOne : ui.countMany.replace("{n}", String(n)));

// The Albums tab: a square cover per album with its title and photo count underneath.
export function AlbumList({ albums, onOpen, focusId }: Props) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusId) return;
    const tiles = grid.current?.querySelectorAll<HTMLElement>("[data-album]") ?? [];
    for (const el of tiles) if (el.dataset.album === focusId) el.focus();
  }, [focusId]);

  return (
    <div className="photo-albums" ref={grid}>
      {albums.map((a) => (
        <button
          key={a.id}
          type="button"
          className="album-tile"
          data-album={a.id}
          onClick={() => onOpen(a.id)}
        >
          {/* biome-ignore lint/performance/noImgElement: plain img by design, files are static */}
          <img
            className="album-cover"
            src={a.items[0].src}
            alt=""
            width={240}
            height={240}
            loading="lazy"
            decoding="async"
          />
          <span className="album-title">{a.title}</span>
          <span className="album-count">{countLabel(a.items.length)}</span>
        </button>
      ))}
    </div>
  );
}
