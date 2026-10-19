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
  track: undefined as { src: string; title: string } | undefined,
  ui: {
    play: "Play",
    pause: "Pause",
    position: "Position",
    volume: "Volume",
  },
};
