import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
import { cvBuilder } from "@/content/cvbuilder";
import { meta } from "@/content/meta";
import { music } from "@/content/music";
import { photos } from "@/content/photos";
import { projects, projectUi } from "@/content/projects";
import { trash, trashHeader } from "@/content/trash";
import { youtube } from "@/content/youtube";

type Walked = { path: string; value: string };

function walk(node: unknown, path: string, out: Walked[]): Walked[] {
  if (typeof node === "string") out.push({ path, value: node });
  else if (Array.isArray(node)) for (const [i, v] of node.entries()) walk(v, `${path}[${i}]`, out);
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, out);
  return out;
}

const all = [
  ...walk(copy, "copy", []),
  ...walk(projects, "projects", []),
  ...walk(cv, "cv", []),
  ...walk(contact, "contact", []),
  ...walk({ trashHeader, trash }, "trash", []),
  ...walk(meta, "meta", []),
  ...walk({ cvBuilder, music, photos, youtube, projectUi }, "apps", []),
];

const wordExempt = (p: string) => /^projects\[\d+\]\.about$/.test(p) || p.startsWith("cv");

describe("content strings", () => {
  it("collects strings from every module", () => {
    expect(all.length).toBeGreaterThan(50);
  });
  it("has no em dash", () => {
    expect(all.filter((s) => s.value.includes("—")).map((s) => s.path)).toEqual([]);
  });
  it("has en dash only between digits", () => {
    const bad = all.filter((s) => /(?<!\d)–|–(?!\d)/.test(s.value));
    expect(bad.map((s) => s.path)).toEqual([]);
  });
  it("keeps strings to 40 words", () => {
    const bad = all.filter((s) => !wordExempt(s.path) && s.value.trim().split(/\s+/).length > 40);
    expect(bad.map((s) => s.path)).toEqual([]);
  });
  it("has no phone-like digit run", () => {
    expect(all.filter((s) => /\d(?: ?\d){8,}/.test(s.value)).map((s) => s.path)).toEqual([]);
  });
  it("has no guestbook or delulu desktop entry", () => {
    expect(copy.menus.view.some((m) => /guestbook/i.test(m.label))).toBe(false);
    expect(copy.desktopIcons.some((i) => /guestbook|delulu/i.test(i.label))).toBe(false);
  });
  it("uses the corrected email", () => {
    expect(contact.email).toBe("brittanykawshalya@gmail.com");
    expect(cv.email).toBe("brittanykawshalya@gmail.com");
    expect(all.some((s) => s.value.includes("gmai.com"))).toBe(false);
  });
  it("opens the right first windows per visitor", () => {
    expect(copy.firstWindows).toEqual({
      recruiter: ["cv"],
      collab: ["cv", "projects"],
      client: ["cv", "contact"],
      friend: ["cv"],
    });
  });
  it("has no About me window, icon or menu item (the Apple menu's About Brittany's Mac stays)", () => {
    const menus = [...copy.menus.brittany, ...copy.menus.view, ...copy.menus.apple];
    expect(copy.desktopIcons.some((i) => i.open === ("about" as string))).toBe(false);
    expect(menus.some((m) => "open" in m && m.open === ("about" as string))).toBe(false);
    expect(menus.some((m) => /about me/i.test(m.label))).toBe(false);
    expect(copy.desktopIcons.some((i) => /about me/i.test(i.label))).toBe(false);
    expect("about" in copy.windowTitles).toBe(false);
    expect(Object.values(copy.firstWindows).flat()).not.toContain("about");
    expect(copy.menus.apple.some((m) => m.label === "About Brittany's Mac")).toBe(true);
  });
  it("lists CV as the first desktop icon", () => {
    expect(copy.desktopIcons[0].open).toBe("cv");
  });
  it("describes the site in the agreed meta description", () => {
    expect(meta.description).toBe(
      "Brittany Perera. Geospatial engineer at PangeAI. CV and side projects.",
    );
  });
  it("builds the copy-failed alert from the contact email", () => {
    expect(copy.alerts.copyEmailFailed).toContain(contact.email);
  });
  it("has a CV title and section headings in content", () => {
    expect(cv.metaTitle).toBeTruthy();
    expect(Object.values(cv.sections).every((v) => v.length > 0)).toBe(true);
  });
  it("has an OK label in copy.chrome", () => {
    expect(copy.chrome.ok).toBe("OK");
  });
  it("walks the photo albums, project UI strings and project sites", () => {
    const paths = all.map((s) => s.path);
    expect(paths).toContain("apps.photos.albums[0].title");
    expect(paths).toContain("apps.photos.ui.watchVideo");
    expect(paths).toContain("apps.projectUi.openSite");
    expect(paths).toContain("projects[0].siteUrl");
  });
  it("lists photo albums with unique ids, General first, and videos that exist", () => {
    const ids = photos.albums.map((a) => a.id);
    expect(ids[0]).toBe("general");
    expect(photos.albums[0].title).toBe("General");
    expect(new Set(ids).size).toBe(ids.length);
    const known = new Set(youtube.videos.map((v) => v.id));
    for (const a of photos.albums)
      for (const id of a.videoIds ?? []) expect(known.has(id)).toBe(true);
  });
  it("has no Travel, Whereflix, Gift Finder or SchengenKit entry in the UI content", () => {
    const menus = [...copy.menus.view, ...copy.desktopIcons];
    expect(menus.some((m) => /travel/i.test(m.label))).toBe(false);
    expect(projects.map((p) => p.title)).toEqual(["100 Days of Delulu", "Group Trip Hero"]);
  });
});

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? tsxFiles(join(dir, e.name))
      : e.name.endsWith(".tsx")
        ? [join(dir, e.name)]
        : [],
  );
}

describe("components carry no user-visible literals", () => {
  const root = new URL("../../src", import.meta.url).pathname;
  const files = [...tsxFiles(join(root, "components")), ...tsxFiles(join(root, "app"))];

  it("finds the component files", () => {
    expect(files.length).toBeGreaterThan(5);
  });
  it("has no JSX text nodes or label literals outside src/content", () => {
    const jsxText = /<[A-Za-z][^<>]*>\s*([A-Za-z][^<>{}]*?)\s*<\//g;
    const bad: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(jsxText)) bad.push(`${f}: ${m[1]}`);
      for (const m of src.matchAll(/\blabel:\s*"([^"]*)"/g)) bad.push(`${f}: label ${m[1]}`);
      for (const m of src.matchAll(/\btitle:\s*"([^"]*)"/g)) bad.push(`${f}: title ${m[1]}`);
    }
    expect(bad).toEqual([]);
  });
});
