import type { IconName } from "@/lib/types";

export type InstrumentId = "guitar" | "piano" | "ukulele";

export const music = {
  folderTitle: "Music",
  appName: "Garage Brittany",
  instruments: [
    { id: "guitar", name: "Electric guitar", icon: "guitar", line: "" },
    { id: "piano", name: "Piano", icon: "piano", line: "" },
    { id: "ukulele", name: "Ukulele", icon: "ukulele", line: "" },
  ] as { id: InstrumentId; name: string; icon: IconName; line: string }[],
  track: undefined as { src: string; title: string } | undefined,
};
