"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { AlertProvider, useAlert, useAlertOpen } from "@/components/alert/AlertProvider";
import { copy } from "@/content/copy";
import { projects, projectUi } from "@/content/projects";
import { pickInk } from "@/lib/contrast";
import { removeKey } from "@/lib/storage";
import type { WinId } from "@/lib/types";
import {
  initialWindows,
  parentOf,
  type TitleMetrics,
  topWindow,
  type WinAction,
  type WinState,
  windowsReducer,
} from "@/lib/windows";
import { DesktopIcons } from "./DesktopIcons";
import { MenuBar } from "./MenuBar";
import { measureTitle } from "./titleMetrics";
import { Window } from "./Window";

const CV_PDF = "/Brittany-Perera-CV.pdf";
const PHONE_QUERY = "(max-width: 700px)";

export type DesktopActions = {
  aboutmac(): void;
  restart(): void;
  download(): void;
  emptytrash(): void;
  crash(): void;
  leave(href: string): void;
  closeall(): void;
};

export type DesktopApi = {
  state: WinState;
  dispatch: Dispatch<WinAction>;
  open(id: WinId): void;
  close(id: WinId): void;
  focus(id: WinId): void;
  accent: string;
  setAccent(hex: string): void;
  actions: DesktopActions;
  /** Opens the YouTube window playing this video id (one from content/youtube). */
  requestVideo(id: string): void;
  /** The latest requestVideo call, for the YouTube window to act on; `seq` makes repeats distinct. */
  videoRequest: { id: string; seq: number } | null;
  /** Runs a menu action by name; `leave` needs an href so it is not reachable from here. */
  runAction(name: string): void;
  soundOn: boolean;
  toggleSound(): void;
  /** True while a full-screen overlay (boot, Setup Assistant) is up: the desktop goes inert behind it. */
  setBusy(busy: boolean): void;
};

const DesktopCtx = createContext<DesktopApi | null>(null);

export function useDesktop(): DesktopApi {
  const api = useContext(DesktopCtx);
  if (!api) throw new Error("useDesktop must be used inside <Desktop>");
  return api;
}

type AudioCtor = typeof AudioContext;

// Two short notes. Never throws: no AudioContext (jsdom, old browsers) or a blocked one is a no-op.
function playChime() {
  try {
    const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const start = ctx.currentTime + 0.02;
    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = start + i * 0.16;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    window.setTimeout(() => void ctx.close().catch(() => {}), 1000);
  } catch {
    // sound is decoration; never let it break the page
  }
}

type DesktopProps = {
  windows: Partial<Record<WinId, ReactNode>>;
  /** Rendered beside the desktop, inside its alert and desktop context (the setup flow plugs in here). */
  children?: ReactNode;
};

function DesktopInner({ windows, children }: DesktopProps) {
  const alert = useAlert();
  const alertOpen = useAlertOpen();
  const [state, dispatch] = useReducer(windowsReducer, initialWindows);
  const [accent, setAccent] = useState(copy.setup.swatches[0].hex);
  const [soundOn, setSoundOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const closedId = useRef<WinId | null>(null);
  const [videoRequest, setVideoRequest] = useState<DesktopApi["videoRequest"]>(null);

  // Re-clamp every open window to the current viewport. Only open windows are measured: a hidden
  // one has no layout, and Window re-clamps it when it next opens.
  const clampWindows = useCallback(() => {
    const sizes: Partial<Record<WinId, TitleMetrics>> = {};
    for (const el of document.querySelectorAll<HTMLElement>("section[data-win]:not([hidden])")) {
      sizes[el.dataset.win as WinId] = measureTitle(el);
    }
    dispatch({
      type: "clampAll",
      viewport: { w: window.innerWidth, h: window.innerHeight },
      sizes,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", clampWindows);
    return () => window.removeEventListener("resize", clampWindows);
  }, [clampWindows]);

  // Leaving phone mode puts stored positions back in play, so check them against the viewport.
  useEffect(() => {
    if (state.mode === "desktop") clampWindows();
  }, [state.mode, clampWindows]);

  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const sync = () => dispatch({ type: "setMode", mode: mq.matches ? "phone" : "desktop" });
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // On <html> so the alert layer, which renders outside this tree's root element, inherits it too.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-ink", pickInk(accent));
    return () => {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-ink");
    };
  }, [accent]);

  const open = useCallback((id: WinId) => dispatch({ type: "open", id }), []);
  const close = useCallback((id: WinId) => {
    closedId.current = id;
    dispatch({ type: "close", id });
  }, []);

  // After a window closes, keep keyboard focus somewhere real: the new top window's close box, else
  // the icon that opens the closed window (or its parent's, for a project window).
  useEffect(() => {
    const id = closedId.current;
    if (!id || state.open.includes(id)) return;
    closedId.current = null;
    const top = topWindow(state);
    const target = top
      ? document.querySelector<HTMLElement>(`section[data-win="${top}"] .close`)
      : (document.querySelector<HTMLElement>(`.icons [data-open="${id}"]`) ??
        document.querySelector<HTMLElement>(`.icons [data-open="${parentOf(id)}"]`));
    target?.focus();
  }, [state]);
  const focus = useCallback((id: WinId) => dispatch({ type: "focus", id }), []);
  const requestVideo = useCallback((id: string) => {
    setVideoRequest((r) => ({ id, seq: (r?.seq ?? 0) + 1 }));
    dispatch({ type: "open", id: "youtube" });
  }, []);

  const actions = useMemo<DesktopActions>(() => {
    const a = copy.alerts;
    return {
      aboutmac: () =>
        alert({
          icon: "mac",
          body: (
            <>
              <b>{a.aboutMac.title}</b>
              <div className="specs">
                {a.aboutMac.specs.map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </div>
            </>
          ),
        }),
      restart: () =>
        alert({
          icon: "caution",
          body: a.restart.text,
          buttons: [
            { label: a.restart.cancel },
            {
              label: a.restart.ok,
              primary: true,
              run: () => {
                removeKey("bp:setup-done");
                window.location.reload();
              },
            },
          ],
        }),
      download: () => {
        const link = document.createElement("a");
        link.href = CV_PDF;
        link.download = CV_PDF.slice(1);
        document.body.appendChild(link);
        link.click();
        link.remove();
        alert({ icon: "note", body: a.download });
      },
      emptytrash: () =>
        alert({
          icon: "caution",
          body: a.emptyTrash.text,
          buttons: [
            { label: a.emptyTrash.keep, primary: true },
            {
              label: a.emptyTrash.empty,
              run: () => alert({ icon: "note", body: a.emptyTrash.after }),
            },
          ],
        }),
      crash: () =>
        alert({
          icon: "bomb",
          body: (
            <>
              <b>{a.crash.title}</b>
              <br />
              {a.crash.text}
            </>
          ),
          buttons: [{ label: a.crash.button, primary: true }],
        }),
      leave: (href: string) =>
        alert({
          icon: "note",
          body: a.leave.text,
          buttons: [
            { label: a.leave.cancel },
            {
              label: a.leave.ok,
              primary: true,
              run: () => window.open(href, "_blank", "noopener"),
            },
          ],
        }),
      closeall: () => dispatch({ type: "closeAll" }),
    };
  }, [alert]);

  const runAction = useCallback(
    (name: string) => {
      if (name === "leave") return;
      const fn = actions[name as keyof DesktopActions] as (() => void) | undefined;
      fn?.();
    },
    [actions],
  );

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      playChime();
      alert({ icon: "note", body: copy.alerts.soundOn });
    }
  }, [soundOn, alert]);

  const api = useMemo<DesktopApi>(
    () => ({
      state,
      dispatch,
      open,
      close,
      focus,
      accent,
      setAccent,
      actions,
      requestVideo,
      videoRequest,
      runAction,
      soundOn,
      toggleSound,
      setBusy,
    }),
    [
      state,
      open,
      close,
      focus,
      accent,
      actions,
      requestVideo,
      videoRequest,
      runAction,
      soundOn,
      toggleSound,
    ],
  );

  const ids: { id: WinId; title: string }[] = [
    ...(Object.entries(copy.windowTitles) as [WinId, string][]).map(([id, title]) => ({
      id,
      title,
    })),
    ...projects.flatMap((p) => [
      {
        id: `project:${p.id}` as WinId,
        title: projectUi.aboutTitle.replace("{title}", p.title),
      },
      { id: `browser:${p.id}` as WinId, title: p.siteLabel },
    ]),
  ];

  return (
    <DesktopCtx.Provider value={api}>
      <div className="desktop" data-mode={state.mode} inert={alertOpen || busy}>
        <MenuBar />
        <DesktopIcons />
        {ids.map(({ id, title }) => (
          <Window key={id} id={id} title={title}>
            {windows[id]}
          </Window>
        ))}
      </div>
      {/* Beside the desktop, not in it: the overlays must stay live while the desktop is inert. */}
      {children}
    </DesktopCtx.Provider>
  );
}

export function Desktop({ windows, children }: DesktopProps) {
  return (
    <AlertProvider>
      <DesktopInner windows={windows}>{children}</DesktopInner>
    </AlertProvider>
  );
}
