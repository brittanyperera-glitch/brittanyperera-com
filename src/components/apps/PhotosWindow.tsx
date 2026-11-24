"use client";

import { useEffect, useState } from "react";
import { useAlertOpen } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { photos } from "@/content/photos";
import { topWindow } from "@/lib/windows";
import { PhotoGrid } from "./photos/PhotoGrid";
import { PhotoViewer } from "./photos/PhotoViewer";
import type { PhotoItem } from "./photos/types";
import "@/styles/photos.css";

const isRange = (t: EventTarget | null) => t instanceof HTMLInputElement && t.type === "range";

export function PhotosWindow({ items = photos.items }: { items?: PhotoItem[] }) {
  const { state } = useDesktop();
  const alertOpen = useAlertOpen();
  const [index, setIndex] = useState(0);
  // Two levels: the grid, then one photo.
  const [viewing, setViewing] = useState(false);
  // The photo just closed, so the grid can put focus back on its thumbnail.
  const [thumb, setThumb] = useState<number | null>(null);

  const front = state.open.includes("photos") && topWindow(state) === "photos";
  const total = items.length;
  const at = Math.min(index, Math.max(0, total - 1));

  useEffect(() => {
    if (!front || alertOpen || total === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      // The focused scroll bar already moves one page on an arrow key; stepping here too would move two.
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (!viewing || isRange(e.target)) return;
        setIndex((at + (e.key === "ArrowRight" ? 1 : -1) + total) % total);
      } else if (e.key === "Escape") {
        if (!viewing) return;
        setThumb(at);
        setViewing(false);
      } else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [front, alertOpen, at, total, viewing]);

  // The title bar already says "Photos"; with nothing to show, the window holds only its heading.
  if (total === 0) return <h3>{photos.title}</h3>;

  if (!viewing) {
    return (
      <PhotoGrid
        items={items}
        focusIndex={thumb}
        onOpen={(i) => {
          setIndex(i);
          setViewing(true);
        }}
      />
    );
  }

  return (
    <PhotoViewer
      items={items}
      index={at}
      onIndex={setIndex}
      onBack={() => {
        setThumb(at);
        setViewing(false);
      }}
    />
  );
}
