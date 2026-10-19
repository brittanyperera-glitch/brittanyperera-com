"use client";

import { useEffect, useState } from "react";
import { useDesktop } from "@/components/desktop/Desktop";
import { youtube } from "@/content/youtube";
import { VideoList } from "./youtube/VideoList";
import { VideoPlayer } from "./youtube/VideoPlayer";
import "@/styles/youtube.css";

export function YouTubeWindow() {
  const { state, actions, videoRequest } = useDesktop();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isOpen = state.open.includes("youtube");
  // The window stays mounted while closed, so closing is what unloads the iframe (and stops audio).
  useEffect(() => {
    if (!isOpen) setPlaying(false);
  }, [isOpen]);

  // A request (the Photos window's "watch the video") picks the video and starts it. An id that is
  // not in the list still opens the window, on whatever was selected, without playing.
  useEffect(() => {
    if (!videoRequest) return;
    const i = youtube.videos.findIndex((v) => v.id === videoRequest.id);
    if (i < 0) return;
    setIndex(i);
    setPlaying(true);
  }, [videoRequest]);

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
