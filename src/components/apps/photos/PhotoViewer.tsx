import { useDesktop } from "@/components/desktop/Desktop";
import { photos } from "@/content/photos";
import { youtube } from "@/content/youtube";
import type { PhotoAlbum } from "./types";

type Props = {
  album: PhotoAlbum;
  index: number;
  onIndex(i: number): void;
  onBack(): void;
};

const ui = photos.ui;

// A Scrapbook page: one photo, its caption, and a Platinum scroll bar to turn the pages.
export function PhotoViewer({ album, index, onIndex, onBack }: Props) {
  const { requestVideo } = useDesktop();
  const total = album.items.length;
  const item = album.items[index];
  const counter = ui.counter.replace("{n}", String(index + 1)).replace("{total}", String(total));
  const videoIds = album.videoIds ?? [];

  return (
    <div className="photo-view">
      <div className="scrap-page">
        <div className="photo-stage">
          {/* biome-ignore lint/performance/noImgElement: plain img by design, files are static */}
          <img src={item.src} alt={item.alt} decoding="async" />
        </div>
        <p className="photo-caption">{item.caption}</p>
      </div>
      <div className="scrap-scrollbar">
        <button type="button" className="pbtn" onClick={() => onIndex((index + total - 1) % total)}>
          {ui.prev}
        </button>
        <input
          type="range"
          className="scrap-scroll"
          min={1}
          max={total}
          step={1}
          value={index + 1}
          disabled={total < 2}
          aria-label={ui.scroll}
          aria-valuetext={counter}
          onChange={(e) => onIndex(Number(e.currentTarget.value) - 1)}
        />
        <button type="button" className="pbtn" onClick={() => onIndex((index + 1) % total)}>
          {ui.next}
        </button>
      </div>
      <div className="scrap-foot">
        <span className="photo-count" aria-live="polite">
          {counter}
        </span>
        {videoIds.map((id) => {
          const title = youtube.videos.find((v) => v.id === id)?.title;
          const label =
            videoIds.length > 1 && title ? ui.watchNamed.replace("{title}", title) : ui.watchVideo;
          return (
            <button key={id} type="button" className="pbtn" onClick={() => requestVideo(id)}>
              {label}
            </button>
          );
        })}
        <button type="button" className="pbtn photo-back" onClick={onBack}>
          {ui.back}
        </button>
      </div>
    </div>
  );
}
