"use client";

import { useEffect, useRef, useState } from "react";
import { music } from "@/content/music";
import "@/styles/music.css";
import { formatTime } from "./format";

type Track = { src: string; title: string; note?: string };

/** `active` is false while the window is closed; the window stays mounted, so playback must stop. */
export function Player({ track, active }: { track: Track; active: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (active) return;
    ref.current?.pause();
    setPlaying(false);
  }, [active]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    // A blocked or failed play() must not leave the button reading Pause.
    Promise.resolve(el.play()).catch(() => setPlaying(false));
    setPlaying(true);
  };

  const ready = Number.isFinite(duration) && duration > 0;

  return (
    <div className="garage">
      <div className="garage-title well">{track.title}</div>
      {track.note ? <p className="garage-note">{track.note}</p> : null}
      {/* biome-ignore lint/a11y/useMediaCaption: her own instrumental, nothing to caption */}
      <audio
        ref={ref}
        src={track.src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="garage-deck">
        <button type="button" className="pbtn garage-play" onClick={toggle}>
          {playing ? music.ui.pause : music.ui.play}
        </button>
        <div className="garage-scrub">
          <input
            type="range"
            aria-label={music.ui.position}
            aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
            min={0}
            max={ready ? duration : 0}
            step={0.1}
            value={Math.min(current, ready ? duration : 0)}
            disabled={!ready}
            onChange={(e) => {
              const t = Number(e.currentTarget.value);
              if (ref.current) ref.current.currentTime = t;
              setCurrent(t);
            }}
          />
          <div className="garage-times">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <label className="garage-volume">
        <span>{music.ui.volume}</span>
        <input
          type="range"
          aria-label={music.ui.volume}
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => {
            const v = Number(e.currentTarget.value);
            if (ref.current) ref.current.volume = v;
            setVolume(v);
          }}
        />
      </label>
    </div>
  );
}
