import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/desktop/IconButton";
import type { PhotoAlbum } from "./types";

type Props = {
  albums: PhotoAlbum[];
  onOpen(id: string): void;
  /** The album just closed, so its folder takes focus again. */
  focusId: string | null;
};

// A Finder window of folders: click selects, double-click or Enter opens, one tap on a phone.
export function AlbumList({ albums, onOpen, focusId }: Props) {
  const [selected, setSelected] = useState<string | null>(focusId);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusId) return;
    const folders = grid.current?.querySelectorAll<HTMLElement>("[data-open]") ?? [];
    for (const el of folders) if (el.dataset.open === focusId) el.focus();
  }, [focusId]);

  return (
    <div className="folder-grid photo-albums" ref={grid}>
      {albums.map((a) => (
        <IconButton
          key={a.id}
          icon="folder"
          label={a.title}
          openId={a.id}
          selected={selected === a.id}
          onSelect={() => setSelected(a.id)}
          onOpen={() => onOpen(a.id)}
        />
      ))}
    </div>
  );
}
