// Launch gate: lists every input from Brittany that is still missing. Not part of `pnpm test`.
import { contact } from "../src/content/contact";
import { music } from "../src/content/music";
import { photos } from "../src/content/photos";
import { projects } from "../src/content/projects";
import { youtube } from "../src/content/youtube";

const missing: string[] = [
  ...(music.track ? [] : ["music: no audio track for Garage Brittany"]),
  ...(photos.items.length > 0 ? [] : ["photos: no photos"]),
  ...projects.filter((p) => !p.about.trim()).map((p) => `projects: no about text for ${p.title}`),
  ...(contact.youtube && youtube.videos.length ? [] : ["youtube: no channel URL or videos"]),
];

if (missing.length) {
  console.error(`launch-check: ${missing.length} input(s) missing`);
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log("launch-check: all inputs present");
