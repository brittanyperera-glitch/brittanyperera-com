// Launch gate: lists every input from Brittany that is still missing. Not part of `pnpm test`.
import { contact } from "../src/content/contact";
import { music } from "../src/content/music";
import { photos } from "../src/content/photos";
import { travel } from "../src/content/travel";
import { youtube } from "../src/content/youtube";

// Instrument lines are optional (Brittany, 2026-10-19: "no lines needed for instruments").
const missing: string[] = [
  ...(music.track ? [] : ["music: no audio track for Garage Brittany"]),
  ...(travel.places.length ? [] : ["travel: no places"]),
  ...(photos.items.length ? [] : ["photos: no photos"]),
  ...(contact.youtube && youtube.videos.length ? [] : ["youtube: no channel URL or videos"]),
];

if (missing.length) {
  console.error(`launch-check: ${missing.length} input(s) missing`);
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log("launch-check: all inputs present");
