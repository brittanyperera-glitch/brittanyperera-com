import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { initialSetup, PHONE_QUERY, setupReducer } from "@/lib/setup";

describe("phone lock phase", () => {
  it("lock replaces the boot, and unlock finishes with no visitor", () => {
    const locked = setupReducer(initialSetup(), { type: "lock" });
    expect(locked.phase).toBe("lock");
    expect(setupReducer(locked, { type: "unlock" })).toMatchObject({
      phase: "done",
      visitor: null,
    });
  });

  it("lock and unlock do nothing outside their phase", () => {
    const steps = { phase: "steps", step: 1, visitor: null } as const;
    expect(setupReducer(steps, { type: "lock" })).toBe(steps);
    expect(setupReducer(initialSetup(), { type: "unlock" })).toEqual(initialSetup());
  });

  it("the phone breakpoint is the one every stylesheet uses", () => {
    expect(PHONE_QUERY).toBe("(max-width: 700px)");
  });
});

describe("phone copy", () => {
  it("every visitor and the neutral dock have four distinct apps that exist", () => {
    const apps = copy.phone.apps;
    expect(apps).not.toContain("cvbuilder");
    for (const id of apps) expect(copy.desktopIcons.map((i) => i.open)).toContain(id);
    for (const dock of Object.values(copy.phone.docks)) {
      expect(dock).toHaveLength(4);
      expect(new Set(dock).size).toBe(4);
      for (const id of dock) expect(apps).toContain(id);
    }
    expect(Object.keys(copy.phone.docks).sort()).toEqual([
      "client",
      "collab",
      "friend",
      "none",
      "recruiter",
    ]);
  });

  it("has the Home label P2 needs", () => {
    expect(copy.chrome.home).toBe("Home");
  });
});
