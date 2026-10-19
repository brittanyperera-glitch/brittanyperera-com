import type { IconName } from "@/lib/types";

export type InstrumentId = "guitar" | "piano" | "ukulele";

export type Instrument = { id: InstrumentId; name: string; icon: IconName; line: string };

export const music = {
  folderTitle: "Music",
  appName: "Garage Brittany",
  instruments: [
    { id: "guitar", name: "Electric guitar", icon: "guitar", line: "" },
    { id: "piano", name: "Piano", icon: "piano", line: "" },
    { id: "ukulele", name: "Ukulele", icon: "ukulele", line: "" },
  ] as Instrument[],
  track: {
    src: "/music/tout-arrive-en-paris.m4a",
    title: "tout arrive en paris",
    note: "composed for my GCSE music, on the piano",
  } as { src: string; title: string; note?: string } | undefined,
  ui: {
    play: "Play",
    pause: "Pause",
    position: "Position",
    volume: "Volume",
  },
};
