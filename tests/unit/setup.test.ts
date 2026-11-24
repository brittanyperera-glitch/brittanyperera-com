import { describe, expect, it } from "vitest";
import {
  initialSetup,
  phoneWindow,
  type SetupAction,
  type SetupState,
  setupReducer,
} from "@/lib/setup";

const run = (s: SetupState, ...actions: SetupAction[]) => actions.reduce(setupReducer, s);
const atStep = (n: 0 | 1 | 2): SetupState => ({
  ...initialSetup(),
  phase: "steps",
  step: n,
});

describe("setupReducer", () => {
  it("starts at boot with no visitor picked", () => {
    expect(initialSetup()).toEqual({
      phase: "boot",
      step: 0,
      visitor: null,
    });
  });

  it("tick moves boot to splash, splash to steps, then stops", () => {
    const s0 = initialSetup();
    const s1 = setupReducer(s0, { type: "tick" });
    expect(s1.phase).toBe("splash");
    const s2 = setupReducer(s1, { type: "tick" });
    expect(s2.phase).toBe("steps");
    expect(setupReducer(s2, { type: "tick" })).toBe(s2);
  });

  it("next advances through the three steps and stops at the last", () => {
    const s = run(
      atStep(0),
      { type: "next" },
      { type: "pickVisitor", visitor: "friend" },
      { type: "next" },
      { type: "next" },
    );
    expect(s.step).toBe(2);
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
    const boot = initialSetup();
    expect(setupReducer(boot, { type: "next" })).toBe(boot);
    expect(setupReducer(boot, { type: "back" })).toBe(boot);
  });

  it("goAhead does nothing before the last step", () => {
    for (const n of [0, 1] as const) {
      const s = atStep(n);
      expect(setupReducer(s, { type: "goAhead" })).toBe(s);
    }
  });

  it("goAhead on the last step starts installing, and installDone finishes", () => {
    const installing = setupReducer({ ...atStep(2), visitor: "friend" }, { type: "goAhead" });
    expect(installing.phase).toBe("installing");
    expect(setupReducer(installing, { type: "installDone" }).phase).toBe("done");
  });

  it("next on step 2 and goAhead do nothing until a visitor is picked", () => {
    const s1 = atStep(1);
    expect(setupReducer(s1, { type: "next" })).toBe(s1);
    const s2 = atStep(2);
    expect(setupReducer(s2, { type: "goAhead" })).toBe(s2);
  });

  it("installDone only counts while installing", () => {
    const s = atStep(2);
    expect(setupReducer(s, { type: "installDone" })).toBe(s);
  });

  it("skip from boot, splash, every step and installing reaches done as recruiter", () => {
    const starts: SetupState[] = [
      initialSetup(),
      { ...initialSetup(), phase: "splash" },
      atStep(0),
      atStep(1),
      atStep(2),
      { ...atStep(2), phase: "installing" },
    ];
    for (const s of starts) {
      const done = setupReducer(s, { type: "skip" });
      expect(done.phase).toBe("done");
      expect(done.visitor).toBe("recruiter");
    }
  });

  it("skip after done changes nothing", () => {
    const done = setupReducer(initialSetup(), { type: "resume", visitor: "client" });
    expect(setupReducer(done, { type: "skip" })).toBe(done);
  });

  it("resume goes straight to done with the given visitor", () => {
    const s = setupReducer(initialSetup(), { type: "resume", visitor: "collab" });
    expect(s.phase).toBe("done");
    expect(s.visitor).toBe("collab");
  });

  it("pickVisitor updates state", () => {
    const s = run(atStep(1), { type: "pickVisitor", visitor: "client" });
    expect(s.visitor).toBe("client");
    expect(s.step).toBe(1);
  });
});

describe("replay", () => {
  it("goes back to boot keeping the visitor, and the splash then ends in done", () => {
    const done = setupReducer(initialSetup(), { type: "resume", visitor: "client" });
    const s = run(done, { type: "replay" });
    expect(s).toEqual({ phase: "boot", step: 0, visitor: "client" });
    expect(run(s, { type: "tick" }, { type: "tick" }).phase).toBe("done");
  });

  it("skip while replaying keeps the stored visitor", () => {
    const s = run(
      setupReducer(initialSetup(), { type: "resume", visitor: "client" }),
      { type: "replay" },
      { type: "skip" },
    );
    expect(s).toEqual({ phase: "done", step: 0, visitor: "client" });
  });

  it("with no visitor there is nothing to replay", () => {
    const s = initialSetup();
    expect(setupReducer(s, { type: "replay" })).toBe(s);
  });
});

describe("phoneWindow", () => {
  it("picks the most relevant single window per visitor", () => {
    expect(phoneWindow("recruiter")).toBe("cv");
    expect(phoneWindow("collab")).toBe("projects");
    expect(phoneWindow("client")).toBe("contact");
    expect(phoneWindow("friend")).toBe("cv");
  });
});
