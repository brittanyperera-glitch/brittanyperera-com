"use client";

import { useEffect, useMemo, useState } from "react";
import { useAlertOpen } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { photos } from "@/content/photos";
import { topWindow } from "@/lib/windows";
import { AlbumList } from "./photos/AlbumList";
import { PhotoViewer } from "./photos/PhotoViewer";
import type { PhotoAlbum } from "./photos/types";
import "@/styles/photos.css";

const GENERAL = "general";

// Only albums with photos, General first; the sort is stable so the rest keep their content order.
function shownAlbums(albums: PhotoAlbum[]): PhotoAlbum[] {
  return albums
    .filter((a) => a.items.length > 0)
    .sort((a, b) => Number(b.id === GENERAL) - Number(a.id === GENERAL));
}

const isRange = (t: EventTarget | null) => t instanceof HTMLInputElement && t.type === "range";

export function PhotosWindow({ albums = photos.albums }: { albums?: PhotoAlbum[] }) {
  const { state } = useDesktop();
  const alertOpen = useAlertOpen();
  const shown = useMemo(() => shownAlbums(albums), [albums]);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  // The album just left, so the list can put focus back on its folder.
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const front = state.open.includes("photos") && topWindow(state) === "photos";
  // Albums can change under us (content edit, fixtures); an unknown id is the album list.
  const album = shown.find((a) => a.id === albumId) ?? null;
  const total = album?.items.length ?? 0;
  const at = Math.min(index, Math.max(0, total - 1));

  const leave = () => {
    setReturnTo(albumId);
    setAlbumId(null);
  };

  useEffect(() => {
    if (!front || alertOpen || !album) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      // The focused scroll bar already moves one page on an arrow key; stepping here too would move two.
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (isRange(e.target)) return;
        setIndex((at + (e.key === "ArrowRight" ? 1 : -1) + total) % total);
      } else if (e.key === "Escape") {
        setReturnTo(album.id);
        setAlbumId(null);
      } else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [front, alertOpen, album, at, total]);

  // The title bar already says "Photos"; with nothing to show, the window holds only its heading.
  if (shown.length === 0) return <h3>{photos.title}</h3>;

  if (!album) {
    return (
      <AlbumList
        albums={shown}
        focusId={returnTo}
        onOpen={(id) => {
          setIndex(0);
          setAlbumId(id);
        }}
      />
    );
  }

  return <PhotoViewer album={album} index={at} onIndex={setIndex} onBack={leave} />;
}
