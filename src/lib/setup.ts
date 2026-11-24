import { copy } from "@/content/copy";
import type { Visitor, WinId } from "./types";

export type SetupPhase = "boot" | "splash" | "steps" | "installing" | "lock" | "done";

export type SetupState = {
  phase: SetupPhase;
  step: 0 | 1 | 2;
  visitor: Visitor | null;
};

export type SetupAction =
  | { type: "tick" }
  | { type: "next" }
  | { type: "back" }
  | { type: "pickVisitor"; visitor: Visitor }
  | { type: "goAhead" }
  | { type: "installDone" }
  | { type: "skip" }
  | { type: "resume"; visitor: Visitor }
  | { type: "replay" }
  | { type: "lock" }
  | { type: "unlock" };

/** Fired on window by the crash alert's Restart; the setup flow replays the boot, same visitor. */
export const REPLAY_EVENT = "bp:replay-boot";

/** localStorage key holding `{ visitor }` once the visitor is known. */
export const DONE_KEY = "bp:setup-done";

/** The width under which the site is a phone: the one query Desktop and SetupFlow agree on. */
export const PHONE_QUERY = "(max-width: 700px)";

export function initialSetup(): SetupState {
  return { phase: "boot", step: 0, visitor: null };
}

export function setupReducer(s: SetupState, a: SetupAction): SetupState {
  switch (a.type) {
    case "tick":
      if (s.phase === "boot") return { ...s, phase: "splash" };
      if (s.phase === "splash") return { ...s, phase: s.visitor ? "done" : "steps" };
      return s;
    case "next":
      return s.phase === "steps" && s.step < 2 && !(s.step === 1 && !s.visitor)
        ? { ...s, step: (s.step + 1) as SetupState["step"] }
        : s;
    case "back":
      return s.phase === "steps" && s.step > 0
        ? { ...s, step: (s.step - 1) as SetupState["step"] }
        : s;
    case "pickVisitor":
      return { ...s, visitor: a.visitor };
    case "goAhead":
      return s.phase === "steps" && s.step === 2 && s.visitor ? { ...s, phase: "installing" } : s;
    case "installDone":
      return s.phase === "installing" ? { ...s, phase: "done" } : s;
    case "skip":
      return s.phase === "done" ? s : { ...s, phase: "done", visitor: s.visitor ?? "recruiter" };
    case "replay":
      return s.visitor ? { phase: "boot", step: 0, visitor: s.visitor } : s;
    // A phone skips the boot and the assistant: a new visitor gets the lock, which opens onto home.
    case "lock":
      return s.phase === "boot" ? { ...s, phase: "lock" } : s;
    case "unlock":
      return s.phase === "lock" ? { ...s, phase: "done" } : s;
    case "resume":
      return { ...s, phase: "done", visitor: a.visitor };
  }
}

/** `/?for=recruiter|collab|client|friend`: the visitor a link was made for, else null. */
export function visitorFromQuery(search: string): Visitor | null {
  const v = new URLSearchParams(search).get("for");
  return copy.setup.visitors.find((x) => x.id === v)?.id ?? null;
}

/** The visitor's main window: the last of their first windows, skipping the note. */
export function phoneWindow(visitor: Visitor): WinId {
  const wins = copy.firstWindows[visitor].filter((id) => id !== "note");
  return wins[wins.length - 1];
}
