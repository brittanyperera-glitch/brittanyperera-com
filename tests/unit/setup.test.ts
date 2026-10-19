import { describe, expect, it } from "vitest";
import {
  initialSetup,
  phoneWindow,
  type SetupAction,
  type SetupState,
  setupReducer,
} from "@/lib/setup";

const ACCENT = "#3d6fb6";
const run = (s: SetupState, ...actions: SetupAction[]) => actions.reduce(setupReducer, s);
const atStep = (n: 0 | 1 | 2 | 3): SetupState => ({
  ...initialSetup(ACCENT),
  phase: "steps",
  step: n,
});

describe("setupReducer", () => {
  it("starts at boot as a friend with the given accent", () => {
    expect(initialSetup(ACCENT)).toEqual({
      phase: "boot",
      step: 0,
      visitor: "friend",
      accent: ACCENT,
    });
  });

  it("tick moves boot to splash, splash to steps, then stops", () => {
    const s0 = initialSetup(ACCENT);
    const s1 = setupReducer(s0, { type: "tick" });
    expect(s1.phase).toBe("splash");
    const s2 = setupReducer(s1, { type: "tick" });
    expect(s2.phase).toBe("steps");
    expect(setupReducer(s2, { type: "tick" })).toBe(s2);
  });

  it("next advances through the four steps and stops at the last", () => {
    const s = run(atStep(0), { type: "next" }, { type: "next" }, { type: "next" });
    expect(s.step).toBe(3);
    expect(setupReducer(s, { type: "next" })).toBe(s);
  });

  it("back on step 0 is a no-op (Back is disabled there)", () => {
    const s = atStep(0);
    expect(setupReducer(s, { type: "back" })).toBe(s);
  });

  it("back steps down from later steps", () => {
    expect(setupReducer(atStep(2), { type: "back" }).step).toBe(1);
  });

  it("next and back do nothing outside the steps phase", () => {
    const boot = initialSetup(ACCENT);
    expect(setupReducer(boot, { type: "next" })).toBe(boot);
    expect(setupReducer(boot, { type: "back" })).toBe(boot);
  });

  it("goAhead does nothing before step 3", () => {
    for (const n of [0, 1, 2] as const) {
      const s = atStep(n);
      expect(setupReducer(s, { type: "goAhead" })).toBe(s);
    }
  });

  it("goAhead on step 3 starts installing, and installDone finishes", () => {
    const installing = setupReducer(atStep(3), { type: "goAhead" });
    expect(installing.phase).toBe("installing");
    expect(setupReducer(installing, { type: "installDone" }).phase).toBe("done");
  });

  it("installDone only counts while installing", () => {
    const s = atStep(3);
    expect(setupReducer(s, { type: "installDone" })).toBe(s);
  });

  it("skip from boot, splash, every step and installing reaches done as recruiter", () => {
    const starts: SetupState[] = [
      initialSetup(ACCENT),
      { ...initialSetup(ACCENT), phase: "splash" },
      atStep(0),
      atStep(1),
      atStep(2),
      atStep(3),
      { ...atStep(3), phase: "installing" },
    ];
    for (const s of starts) {
      const done = setupReducer(s, { type: "skip" });
      expect(done.phase).toBe("done");
      expect(done.visitor).toBe("recruiter");
    }
  });

  it("skip after done changes nothing", () => {
    const done = setupReducer(initialSetup(ACCENT), { type: "resume", visitor: "client" });
    expect(setupReducer(done, { type: "skip" })).toBe(done);
  });

  it("resume goes straight to done with the given visitor", () => {
    const s = setupReducer(initialSetup(ACCENT), { type: "resume", visitor: "collab" });
    expect(s.phase).toBe("done");
    expect(s.visitor).toBe("collab");
  });

  it("pickVisitor and pickAccent update state", () => {
    const s = run(
      atStep(1),
      { type: "pickVisitor", visitor: "client" },
      { type: "pickAccent", accent: "#b8475f" },
    );
    expect(s.visitor).toBe("client");
    expect(s.accent).toBe("#b8475f");
    expect(s.step).toBe(1);
  });
});

describe("phoneWindow", () => {
  it("picks the most relevant single window per visitor", () => {
    expect(phoneWindow("recruiter")).toBe("cv");
    expect(phoneWindow("collab")).toBe("projects");
    expect(phoneWindow("client")).toBe("contact");
    expect(phoneWindow("friend")).toBe("about");
  });
});
