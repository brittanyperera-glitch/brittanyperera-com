"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useAlert, useAlertOpen } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { initialSetup, phoneWindow, setupReducer } from "@/lib/setup";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Visitor } from "@/lib/types";
import "@/styles/phone.css";
import "@/styles/setup.css";
import { BOOT_ICONS, Boot } from "./Boot";
import { SetupAssistant } from "./SetupAssistant";

const DONE_KEY = "bp:setup-done";
const ACCENT_KEY = "bp:accent";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const BOOT_MS = 900;
const MARCH_START_MS = 200;
const MARCH_STEP_MS = 220;
const SPLASH_TAIL_MS = 400;
const HELLO_MS = 1800;
const INSTALL_TAIL_MS = 700;

const isVisitor = (v: unknown): v is Visitor => copy.setup.visitors.some((x) => x.id === v);
const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

/**
 * First-visit boot screen and Setup Assistant. Mount it as a child of <Desktop>. It renders the
 * boot overlay on the server, then reads the stored visitor after hydration and either resumes or
 * runs the assistant; on finishing it opens that visitor's windows.
 */
export function SetupFlow() {
  const { open, setAccent, accent: deskAccent, state: desk } = useDesktop();
  const alert = useAlert();
  const alertOpen = useAlertOpen();
  const [s, dispatch] = useReducer(setupReducer, deskAccent, initialSetup);
  const [marched, setMarched] = useState(0);
  const [helloIndex, setHelloIndex] = useState(0);
  const [installLine, setInstallLine] = useState(-1);
  const [reduced, setReduced] = useState(false);
  const finished = useRef(false);

  // Storage and matchMedia are read after hydration, before paint, so a returning visitor does not
  // see the boot screen flash and the server render stays identical to the first client render.
  useLayoutEffect(() => {
    setReduced(window.matchMedia(REDUCED_QUERY).matches);
    const saved = readJSON<{ visitor?: unknown } | null>(DONE_KEY, null);
    if (saved && isVisitor(saved.visitor)) {
      const accent = readJSON<unknown>(ACCENT_KEY, null);
      if (isHex(accent)) dispatch({ type: "pickAccent", accent });
      dispatch({ type: "resume", visitor: saved.visitor });
    }
  }, []);

  useEffect(() => {
    if (s.phase === "boot") {
      const t = window.setTimeout(() => dispatch({ type: "tick" }), BOOT_MS);
      return () => window.clearTimeout(t);
    }
    if (s.phase === "splash") {
      const ids = BOOT_ICONS.map((_, i) =>
        window.setTimeout(() => setMarched(i + 1), MARCH_START_MS + i * MARCH_STEP_MS),
      );
      ids.push(
        window.setTimeout(
          () => dispatch({ type: "tick" }),
          MARCH_START_MS + BOOT_ICONS.length * MARCH_STEP_MS + SPLASH_TAIL_MS,
        ),
      );
      return () => {
        for (const id of ids) window.clearTimeout(id);
      };
    }
  }, [s.phase]);

  const onIntro = s.phase === "steps" && s.step === 0;
  useEffect(() => {
    if (!onIntro || reduced) return;
    const id = window.setInterval(() => setHelloIndex((i) => i + 1), HELLO_MS);
    return () => window.clearInterval(id);
  }, [onIntro, reduced]);

  useEffect(() => {
    if (s.phase !== "installing") return;
    const hold = reduced ? 2000 : 1000;
    const lines = copy.setup.installLines;
    const ids = lines.map((_, i) => window.setTimeout(() => setInstallLine(i), i * hold));
    ids.push(
      window.setTimeout(
        () => dispatch({ type: "installDone" }),
        (lines.length - 1) * hold + INSTALL_TAIL_MS,
      ),
    );
    return () => {
      for (const id of ids) window.clearTimeout(id);
    };
  }, [s.phase, reduced]);

  // Esc skips, but an open alert owns Esc first.
  useEffect(() => {
    if (s.phase === "done" || alertOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "skip" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [s.phase, alertOpen]);

  // Runs once. On a phone the Desktop's mode flips in its own mount effect, which has already been
  // applied by the time any done state is rendered, so desk.mode is right here.
  useEffect(() => {
    if (s.phase !== "done" || finished.current) return;
    finished.current = true;
    writeJSON(DONE_KEY, { visitor: s.visitor });
    writeJSON(ACCENT_KEY, s.accent);
    setAccent(s.accent);
    if (desk.mode === "phone") {
      open(phoneWindow(s.visitor));
      alert({ icon: "note", body: copy.alerts.phone });
    } else {
      for (const id of copy.firstWindows[s.visitor]) open(id);
    }
  }, [s.phase, s.visitor, s.accent, desk.mode, open, setAccent, alert]);

  if (s.phase === "done") return null;

  const skip = () => dispatch({ type: "skip" });

  if (s.phase === "boot" || s.phase === "splash") {
    return <Boot phase={s.phase} marched={marched} onSkip={skip} />;
  }

  return (
    <SetupAssistant
      step={s.step}
      visitor={s.visitor}
      accent={s.accent}
      helloIndex={helloIndex}
      reduced={reduced}
      installing={s.phase === "installing"}
      installLine={installLine}
      onSkip={skip}
      onBack={() => dispatch({ type: "back" })}
      onNext={() => dispatch({ type: "next" })}
      onGoAhead={() => dispatch({ type: "goAhead" })}
      onPickVisitor={(visitor) => dispatch({ type: "pickVisitor", visitor })}
      onPickAccent={(accent) => {
        dispatch({ type: "pickAccent", accent });
        setAccent(accent);
      }}
    />
  );
}
