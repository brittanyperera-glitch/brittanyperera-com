import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

// The CV text lives outside this repo; override the path with CV_SOURCE.
const CV_SOURCE =
  process.env.CV_SOURCE ?? "/Users/brittanyperera/Desktop/Personal Projects/CV/source/content.js";

const root = resolve(import.meta.dirname, "..");

// The site writes ranges as "May 2026 to now" and keeps en dashes for digit ranges only.
const norm = (s: string) => s.replace(/ – /g, " to ").replace(/\bPresent\b/g, "now");
const isPhone = (s: string) => /^\+?[\d\s]{9,}$/.test(s);

type Src = {
  name: string;
  title: string;
  contact: { text: string; href?: string }[];
  profile: string;
  experience: { role: string; org: string; place: string; dates: string; bullets: string[] }[];
  projects: { label: string; items: { name: string; text: string }[] }[];
  skills: [string, string][];
  education: { role: string; org: string; dates: string; lines: string[] }[];
  leadership: [string, string, string][];
  additional: [string, string][];
};

export function toCvData(src: Src) {
  const extra = (label: string) => src.additional.find(([l]) => l === label)?.[1] ?? "";
  return {
    name: src.name,
    title: src.title,
    profile: src.profile,
    contact: src.contact.filter((c) => !isPhone(c.text)),
    experience: src.experience.map((e) => ({ ...e, dates: norm(e.dates) })),
    projects: src.projects.map((p) => ({ label: norm(p.label), items: p.items })),
    skills: src.skills,
    education: src.education.map((e) => ({ ...e, dates: norm(e.dates) })),
    leadership: src.leadership.map(([role, dates, text]) => ({ role, dates: norm(dates), text })),
    languages: extra("Languages"),
    awards: extra("Awards"),
  };
}

function main() {
  const src = createRequire(import.meta.url)(CV_SOURCE) as Src;
  const out = join(root, "src/content/cv-data.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(toCvData(src), null, 2)}\n`);
  // Biome's JSON layout differs from JSON.stringify; format so `pnpm lint` stays green.
  execFileSync("pnpm", ["exec", "biome", "format", "--write", out], { cwd: root, stdio: "ignore" });
  copyFileSync(
    join(dirname(CV_SOURCE), "..", "Brittany_Perera_CV_2026_public.pdf"),
    join(root, "public/Brittany-Perera-CV.pdf"),
  );
  console.log(`synced ${CV_SOURCE}`);
}

if (process.argv[1] === import.meta.filename) main();
