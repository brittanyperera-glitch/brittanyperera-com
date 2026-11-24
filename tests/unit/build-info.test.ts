import { describe, expect, it } from "vitest";
import info from "@/content/build-info.json";
import { buildInfo } from "../../scripts/build-info";

describe("build-info.json", () => {
  it("matches a fresh count, so a stale file fails CI (run pnpm build-info)", () => {
    expect(info).toEqual(buildInfo());
  });
});
