import { describe, expect, it } from "vitest";
import data from "@/content/cv-data.json";
import { cvBuilder } from "@/content/cvbuilder";

const corpus = JSON.stringify(data);

describe("CV Builder lines match the CV", () => {
  it("every number in a piece label appears in cv-data.json", () => {
    const missing = cvBuilder.pieceLabels.flatMap((label) =>
      (label.match(/\d[\d,.]*%?/g) ?? [])
        .map((n) => n.replace(/[.,]$/, ""))
        .filter((n) => !corpus.includes(n))
        .map((n) => `${n} in "${label}"`),
    );
    expect(missing).toEqual([]);
  });

  it("each timeline year falls inside the matching role's dates", () => {
    const sources: [RegExp, string][] = [
      [/Oxford/, data.education[0].dates],
      [/F1/, data.experience.find((r) => r.org.includes("Mercedes"))?.dates ?? ""],
      [/VietJet/, data.experience.find((r) => r.org.includes("VietJet"))?.dates ?? ""],
    ];
    for (const [pattern, dates] of sources) {
      const entry = cvBuilder.entries.find((e) => pattern.test(e.label));
      expect(entry, String(pattern)).toBeDefined();
      const span = (dates.match(/\d{4}/g) ?? []).map(Number);
      const years = (entry?.when ?? "").match(/\d{2,4}/g) ?? [];
      expect(years.length, entry?.when).toBeGreaterThan(0);
      for (const y of years.map((s) => (s.length === 2 ? 2000 + Number(s) : Number(s)))) {
        expect(y, `${entry?.when} vs ${dates}`).toBeGreaterThanOrEqual(span[0]);
        expect(y, `${entry?.when} vs ${dates}`).toBeLessThanOrEqual(span[1]);
      }
    }
  });
});
