import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import info from "@/content/build-info.json";
import { buildInfo, countTests } from "../../scripts/build-info";

// The site shows counts rounded down with a "+", so the committed file only has to stay a true
// lower bound; `prebuild` rewrites it on every deploy.
const roundDown = (n: number) => Math.floor(n / 10) * 10;

describe("build-info.json", () => {
  const fresh = buildInfo();

  it("never claims more tests than exist", () => {
    expect(roundDown(info.unitTests)).toBeLessThanOrEqual(fresh.unitTests);
    expect(roundDown(info.e2eTests)).toBeLessThanOrEqual(fresh.e2eTests);
  });

  it("names the installed stack versions", () => {
    expect(info.stack).toEqual(fresh.stack);
  });

  it("does not count regex .test( calls as tests", () => {
    const f = join(mkdtempSync(join(tmpdir(), "bi-")), "x.test.ts");
    writeFileSync(
      f,
      'it("a", () => { expect(/x/.test("x")).toBe(true); });\ntest("b", () => {});\n',
    );
    expect(countTests([f])).toBe(2);
  });
});
