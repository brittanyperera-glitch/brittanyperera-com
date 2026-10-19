import { youtube } from "@/content/youtube";
import { thumbUrl } from "./urls";

type Props = { selected: number; thumbs: boolean; onSelect(index: number): void };

export function VideoList({ selected, thumbs, onSelect }: Props) {
  return (
    <ul className="yt-list" aria-label={youtube.ui.moreVideos}>
      {youtube.videos.map((v, i) => (
        <li key={v.id}>
          <button
            type="button"
            className={i === selected ? "yt-item current" : "yt-item"}
            aria-label={v.title}
            aria-current={i === selected ? "true" : undefined}
            onClick={() => onSelect(i)}
          >
            {thumbs ? (
              // biome-ignore lint/performance/noImgElement: plain img by design, the thumbnail is remote
              <img src={thumbUrl(v.id)} alt={v.title} loading="lazy" decoding="async" />
            ) : null}
            <span className="yt-item-title">{v.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
