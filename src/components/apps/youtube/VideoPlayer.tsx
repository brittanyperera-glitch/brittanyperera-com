import { youtube } from "@/content/youtube";
import { embedUrl, thumbUrl, type Video } from "./urls";

type Props = { video: Video; playing: boolean; onPlay(): void };

// Click-to-load facade: no request to YouTube's player until the visitor asks for it.
export function VideoPlayer({ video, playing, onPlay }: Props) {
  return (
    <div className="yt-main">
      <div className="yt-stage">
        {playing ? (
          <iframe
            key={video.id}
            className="yt-frame"
            src={embedUrl(video.id)}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="yt-facade"
            aria-label={youtube.ui.playLabel.replace("{title}", video.title)}
            onClick={onPlay}
          >
            {/* biome-ignore lint/performance/noImgElement: plain img by design, the thumbnail is remote */}
            <img src={thumbUrl(video.id)} alt="" decoding="async" />
            <span className="yt-play" aria-hidden="true" />
          </button>
        )}
      </div>
      <h2 className="yt-title">{video.title}</h2>
      <p className="yt-by">
        {youtube.ui.by} <b>{youtube.channelName}</b>
      </p>
    </div>
  );
}
