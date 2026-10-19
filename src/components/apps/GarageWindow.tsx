"use client";

import { Player } from "@/components/apps/music/Player";
import { useDesktop } from "@/components/desktop/Desktop";
import { music } from "@/content/music";

export function GarageWindow({
  track = music.track,
}: {
  track?: { src: string; title: string; note?: string } | null;
}) {
  const { state } = useDesktop();
  if (!track) return <h3>{music.appName}</h3>;
  return <Player track={track} active={state.open.includes("garage")} />;
}
