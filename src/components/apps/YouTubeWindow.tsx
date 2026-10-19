"use client";

import { useEffect, useState } from "react";
import { useDesktop } from "@/components/desktop/Desktop";
import { youtube } from "@/content/youtube";
import { VideoList } from "./youtube/VideoList";
import { VideoPlayer } from "./youtube/VideoPlayer";
import "@/styles/youtube.css";

export function YouTubeWindow() {
  const { state, actions } = useDesktop();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isOpen = state.open.includes("youtube");
  // The window stays mounted while closed, so closing is what unloads the iframe (and stops audio).
  useEffect(() => {
    if (!isOpen) setPlaying(false);
  }, [isOpen]);

  const video = youtube.videos[index];

  return (
    <div className="yt">
      <div className="yt-head">
        <span className="yt-wordmark">
          {youtube.ui.wordmarkLead}
          <span className="yt-tube">{youtube.ui.wordmarkTail}</span>
        </span>
      </div>
      <div className="yt-page">
        <VideoPlayer video={video} playing={isOpen && playing} onPlay={() => setPlaying(true)} />
        <aside className="yt-side">
          <h3 className="yt-more">{youtube.ui.moreVideos}</h3>
          <VideoList
            selected={index}
            onSelect={(i) => {
              setIndex(i);
              setPlaying(false);
            }}
          />
          <button
            type="button"
            className="pbtn yt-channel"
            onClick={() => actions.leave(youtube.channelUrl)}
          >
            {youtube.ui.channelLink}
          </button>
        </aside>
      </div>
    </div>
  );
}
