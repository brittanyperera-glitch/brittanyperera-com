import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

// A `biome migrate --write` once swapped "recommended": true for "preset": "none",
// which made `pnpm lint` pass while checking nothing.
test("biome runs its recommended rule set", () => {
  const config = JSON.parse(readFileSync(new URL("../../biome.json", import.meta.url), "utf8"));
  expect(config.linter.enabled).toBe(true);
  expect(config.linter.rules.recommended).toBe(true);
  expect(config.linter.rules.preset).toBeUndefined();
});
