import { copy } from "@/content/copy";
import type { Visitor, WinId } from "./types";

export type SetupPhase = "boot" | "splash" | "steps" | "installing" | "done";

export type SetupState = {
  phase: SetupPhase;
  step: 0 | 1 | 2;
  visitor: Visitor;
};

export type SetupAction =
  | { type: "tick" }
  | { type: "next" }
  | { type: "back" }
  | { type: "pickVisitor"; visitor: Visitor }
  | { type: "goAhead" }
  | { type: "installDone" }
  | { type: "skip" }
  | { type: "resume"; visitor: Visitor };

export function initialSetup(): SetupState {
  return { phase: "boot", step: 0, visitor: "friend" };
}

export function setupReducer(s: SetupState, a: SetupAction): SetupState {
  switch (a.type) {
    case "tick":
      if (s.phase === "boot") return { ...s, phase: "splash" };
      if (s.phase === "splash") return { ...s, phase: "steps" };
      return s;
    case "next":
      return s.phase === "steps" && s.step < 2
        ? { ...s, step: (s.step + 1) as SetupState["step"] }
        : s;
    case "back":
      return s.phase === "steps" && s.step > 0
        ? { ...s, step: (s.step - 1) as SetupState["step"] }
        : s;
    case "pickVisitor":
      return { ...s, visitor: a.visitor };
    case "goAhead":
      return s.phase === "steps" && s.step === 2 ? { ...s, phase: "installing" } : s;
    case "installDone":
      return s.phase === "installing" ? { ...s, phase: "done" } : s;
    case "skip":
      return s.phase === "done" ? s : { ...s, phase: "done", visitor: "recruiter" };
    case "resume":
      return { ...s, phase: "done", visitor: a.visitor };
  }
}

/** The one window a phone shows: the last of the visitor's first windows (about, cv, projects...). */
export function phoneWindow(visitor: Visitor): WinId {
  const wins = copy.firstWindows[visitor];
  return wins[wins.length - 1];
}
