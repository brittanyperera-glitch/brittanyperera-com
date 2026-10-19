import { expect, test } from "vitest";
import type { WinId } from "@/lib/types";

test("the @ alias resolves and types load", () => {
  const id: WinId = "project:trip";
  expect(id).toBe("project:trip");
});
