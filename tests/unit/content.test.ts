import { describe, expect, it } from "vitest";
import { about } from "@/content/about";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
import { meta } from "@/content/meta";
import { projects } from "@/content/projects";
import { trash, trashHeader } from "@/content/trash";

type Walked = { path: string; value: string };

function walk(node: unknown, path: string, out: Walked[]): Walked[] {
  if (typeof node === "string") out.push({ path, value: node });
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
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
});
