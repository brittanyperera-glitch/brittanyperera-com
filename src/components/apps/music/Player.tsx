"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
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
  // The window is mounted while closed; fetch nothing until it has been opened once.
  const [opened, setOpened] = useState(active);
  if (active && !opened) setOpened(true);

  useEffect(() => {
    if (active) return;
    ref.current?.pause();
    setPlaying(false);
  }, [active]);

  const play = () => {
    const el = ref.current;
    if (!el || playing) return;
    // A blocked or failed play() must not leave the LCD reading Play.
    Promise.resolve(el.play()).catch(() => setPlaying(false));
    setPlaying(true);
  };

  const pause = () => {
    ref.current?.pause();
    setPlaying(false);
  };

  const ready = Number.isFinite(duration) && duration > 0;
  const progress = ready ? Math.min(1, current / duration) : 0;
  const bar = { "--p": `${progress * 100}%` } as CSSProperties;
  const level = { "--p": `${volume * 100}%` } as CSSProperties;
  const total = ready ? formatTime(duration) : music.ui.unknownTime;

  return (
    <div className="garage">
      <div className="garage-face">
        <div className="garage-lcd" data-state={playing ? "play" : "pause"}>
          <div className="garage-readout">
            <div className="garage-state">{playing ? music.ui.play : music.ui.pause}</div>
            <div className="garage-title">{track.title}</div>
            {track.note ? <p className="garage-note">{track.note}</p> : null}
          </div>
          <div className="garage-time">
            <span className="garage-digits">
              <span className="garage-ghost" aria-hidden="true">
                88:88
              </span>
              <span className="garage-elapsed">{formatTime(current)}</span>
            </span>
            <small>
              / <span className="garage-total">{total}</span>
            </small>
          </div>
          <div className="garage-pos" style={bar} aria-hidden="true">
            <i />
            <b />
          </div>
        </div>
        {/* biome-ignore lint/a11y/useMediaCaption: her own instrumental, nothing to caption */}
        <audio
          ref={ref}
          src={track.src}
          preload={opened ? "metadata" : "none"}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <div className="garage-controls">
          <div className="garage-transport">
            <div className="garage-key">
              <button
                type="button"
                className={playing ? "garage-btn garage-play pressed" : "garage-btn garage-play"}
                aria-label={music.ui.play}
                onClick={play}
              >
                <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
                  <path d="M4 2L18 11L4 20Z" fill="#2a2a2a" stroke="#111" strokeLinejoin="round" />
                  <path d="M5.5 4.8L14.8 11" stroke="#fff" strokeOpacity=".35" />
                </svg>
              </button>
              <span className="garage-engr" aria-hidden="true">
                {music.ui.play}
              </span>
            </div>
            <div className="garage-key">
              <button
                type="button"
                className="garage-btn garage-pause"
                aria-label={music.ui.pause}
                onClick={pause}
              >
                <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="4" height="13" rx=".8" fill="#2a2a2a" />
                  <rect x="8.5" y="1.5" width="4" height="13" rx=".8" fill="#2a2a2a" />
                </svg>
              </button>
              <span className="garage-engr" aria-hidden="true">
                {music.ui.pause}
              </span>
            </div>
          </div>
          <div className="garage-sliders">
            <span className="garage-engr" aria-hidden="true">
              {music.ui.position}
            </span>
            <input
              type="range"
              className="garage-slider"
              style={bar}
              aria-label={music.ui.position}
              aria-valuetext={`${formatTime(current)} / ${total}`}
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
            <span className="garage-engr" aria-hidden="true">
              {music.ui.volume}
            </span>
            <input
              type="range"
              className="garage-slider"
              style={level}
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
          </div>
        </div>
      </div>
    </div>
  );
}
