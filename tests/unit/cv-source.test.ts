import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import data from "@/content/cv-data.json";

const PDFTOTEXT = "/opt/homebrew/bin/pdftotext";
const PDF = join(process.cwd(), "public", "Brittany-Perera-CV.pdf");

// Dashes, non-breaking hyphens and whitespace differ between the JSON and the PDF; drop them.
const squash = (s: string) => s.toLowerCase().replace(/[\s \-‐-―−]/g, "");
const whenToPdf = (w: string) => w.replace(/ to now$/, " – Present").replace(/ to /g, " – ");

function pdfText(): string {
  if (!existsSync(PDFTOTEXT)) {
    throw new Error(`pdftotext is required at ${PDFTOTEXT} (brew install poppler); not skipping.`);
  }
  return squash(execFileSync(PDFTOTEXT, [PDF, "-"], { encoding: "utf8" }));
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
});
