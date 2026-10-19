// Launch gate: lists every input from Brittany that is still missing. Not part of `pnpm test`.
import { contact } from "../src/content/contact";
import { music } from "../src/content/music";
import { photos } from "../src/content/photos";
import { travel } from "../src/content/travel";

const missing: string[] = [
  ...music.instruments
    .filter((i) => !i.line.trim())
    .map((i) => `music: line for ${i.name} is empty`),
  ...(music.track ? [] : ["music: no audio track for Garage Brittany"]),
  ...(travel.places.length ? [] : ["travel: no places"]),
  ...(photos.items.length ? [] : ["photos: no photos"]),
  ...(contact.youtube ? [] : ["contact: no YouTube channel URL"]),
];

if (missing.length) {
  console.error(`launch-check: ${missing.length} input(s) missing`);
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log("launch-check: all inputs present");
