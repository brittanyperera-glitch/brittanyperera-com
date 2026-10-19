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

export function PhotosWindow({ items = photos.items }: { items?: PhotoItem[] }) {
  const { state } = useDesktop();
  const alertOpen = useAlertOpen();
  // Index being viewed, or null for the grid. `returnTo` lets the grid refocus the thumbnail left.
  const [selected, setSelected] = useState<number | null>(null);
  const [returnTo, setReturnTo] = useState<number | null>(null);

  const front = state.open.includes("photos") && topWindow(state) === "photos";
  const total = items.length;
  // Items can shrink under us (content edit, fixtures); treat an out-of-range index as the grid.
  const viewing = selected !== null && selected < total ? selected : null;

  useEffect(() => {
    if (!front || alertOpen || viewing === null) return;
    const step = (by: number) => setSelected((viewing + by + total) % total);
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") {
        setReturnTo(viewing);
        setSelected(null);
      } else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [front, alertOpen, viewing, total]);

  // The title bar already says "Photos"; with nothing to show, the window holds only its heading.
  if (total === 0) return <h3>{photos.title}</h3>;

  if (viewing === null) {
    return <PhotoGrid items={items} focusIndex={returnTo} onSelect={setSelected} />;
  }

  return (
    <PhotoViewer
      item={items[viewing]}
      index={viewing}
      total={total}
      onPrev={() => setSelected((viewing + total - 1) % total)}
      onNext={() => setSelected((viewing + 1) % total)}
      onBack={() => {
        setReturnTo(viewing);
        setSelected(null);
      }}
    />
  );
}
