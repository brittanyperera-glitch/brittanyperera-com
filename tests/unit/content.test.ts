import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { about } from "@/content/about";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
import { cvBuilder } from "@/content/cvbuilder";
import { meta } from "@/content/meta";
import { music } from "@/content/music";
import { photos } from "@/content/photos";
import { projects } from "@/content/projects";
import { trash, trashHeader } from "@/content/trash";
import { travel } from "@/content/travel";

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
  ...walk(about, "about", []),
  ...walk(projects, "projects", []),
  ...walk(cv, "cv", []),
  ...walk(contact, "contact", []),
  ...walk({ trashHeader, trash }, "trash", []),
  ...walk(meta, "meta", []),
  ...walk({ cvBuilder, music, travel, photos }, "apps", []),
];

const wordExempt = (p: string) =>
  /^about\.timeline\[\d+\]\.text$/.test(p) ||
  /^projects\[\d+\]\.blurb$/.test(p) ||
  p.startsWith("cv");

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
      recruiter: ["about", "cv"],
      collab: ["about", "projects"],
      client: ["about", "contact"],
      friend: ["about"],
    });
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
