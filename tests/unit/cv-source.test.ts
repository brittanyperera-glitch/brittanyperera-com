import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import data from "@/content/cv-data.json";

const PDF = join(process.cwd(), "public", "Brittany-Perera-CV.pdf");

// Dashes, quotes, ligatures, non-breaking hyphens and whitespace differ between the JSON and the
// PDF text; drop or fold them.
const squash = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[\s\-‐-―−]/g, "");
const whenToPdf = (w: string) => w.replace(/ to now$/, " – Present").replace(/ to /g, " – ");

function pdfText(): string {
  try {
    return squash(execFileSync("pdftotext", [PDF, "-"], { encoding: "utf8" }));
  } catch (e) {
    throw new Error(`pdftotext must be on PATH (brew install poppler); not skipping. ${e}`);
  }
}

describe("cv-data.json matches the public PDF", () => {
  it("has no phone-like digit run", () => {
    const json = JSON.stringify(data);
    expect(json).not.toMatch(/\d(?: ?\d){8,}/);
    expect(json).not.toMatch(/\+\d/);
  });

  it("every role and education title, org and date appears in the PDF text", () => {
    const text = pdfText();
    const rows = [...data.experience, ...data.education].flatMap((r) => [r.role, r.org, r.dates]);
    const missing = rows.filter(Boolean).filter((s) => !text.includes(squash(whenToPdf(s))));
    expect(missing).toEqual([]);
  });

  it("every bullet, project, leadership line, skill, language and award appears in the PDF text", () => {
    const text = pdfText();
    const strings = [
      ...data.experience.flatMap((r) => r.bullets),
      ...data.projects.flatMap((p) => [
        whenToPdf(p.label),
        ...p.items.flatMap((i) => [i.name, i.text]),
      ]),
      ...data.education.flatMap((e) => e.lines),
      ...data.leadership.flatMap((l) => [l.role, whenToPdf(l.dates), l.text]),
      ...data.skills.flat(),
      data.languages,
      data.awards,
    ];
    const missing = strings.filter(Boolean).filter((s) => !text.includes(squash(s)));
    expect(missing).toEqual([]);
  });
});
