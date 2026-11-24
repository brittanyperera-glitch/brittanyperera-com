export const music = {
  folderTitle: "Music",
  appName: "Garage Brittany",
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
    // LCD total before the browser has read the track's length.
    unknownTime: "--:--",
  },
};
