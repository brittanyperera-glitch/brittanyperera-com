import type { PhotoItem } from "./types";

type Props = {
  items: PhotoItem[];
  onSelect(index: number): void;
  /** Index of the thumbnail that should take focus (the one just closed), if any. */
  focusIndex: number | null;
};

export function PhotoGrid({ items, onSelect, focusIndex }: Props) {
  return (
    <ul className="photo-grid">
      {items.map((item, i) => (
        <li key={item.src}>
          <button
            type="button"
            className="photo-thumb"
            onClick={() => onSelect(i)}
            ref={(el) => {
              if (el && focusIndex === i) el.focus();
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: plain img by design, files are static */}
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
          </button>
        </li>
      ))}
    </ul>
  );
}
