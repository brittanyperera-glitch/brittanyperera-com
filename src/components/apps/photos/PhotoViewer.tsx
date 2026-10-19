import { photos } from "@/content/photos";
import type { PhotoItem } from "./types";

type Props = {
  item: PhotoItem;
  index: number;
  total: number;
  onPrev(): void;
  onNext(): void;
  onBack(): void;
};

export function PhotoViewer({ item, index, total, onPrev, onNext, onBack }: Props) {
  const counter = photos.counter
    .replace("{n}", String(index + 1))
    .replace("{total}", String(total));
  return (
    <div className="photo-view">
      <div className="photo-stage">
        {/* biome-ignore lint/performance/noImgElement: plain img by design, files are static */}
        <img src={item.src} alt={item.alt} decoding="async" />
      </div>
      <p className="photo-caption">{item.caption}</p>
      <div className="photo-bar">
        <button type="button" className="pbtn" onClick={onPrev}>
          {photos.prev}
        </button>
        <span className="photo-count" aria-live="polite">
          {counter}
        </span>
        <button type="button" className="pbtn" onClick={onNext}>
          {photos.next}
        </button>
        <button type="button" className="pbtn photo-back" onClick={onBack}>
          {photos.back}
        </button>
      </div>
    </div>
  );
}
