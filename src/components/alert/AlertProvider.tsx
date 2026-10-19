"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PixelIcon } from "@/components/PixelIcon";
import "@/styles/alert.css";

export type AlertOptions = {
  icon: "caution" | "note" | "bomb" | "mac";
  body: ReactNode;
  buttons?: { label: string; primary?: boolean; run?: () => void }[];
};

const DEFAULT_BUTTONS: NonNullable<AlertOptions["buttons"]> = [{ label: "OK", primary: true }];

const OpenCtx = createContext(false);
const ShowCtx = createContext<(opts: AlertOptions) => void>(() => {});

export function AlertProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<AlertOptions | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = current !== null;
  const buttonsRef = useRef<HTMLDivElement>(null);

  const show = useCallback((opts: AlertOptions) => {
    // A replacing alert keeps the element focused before the first one opened.
    if (returnFocus.current === null)
      returnFocus.current = document.activeElement as HTMLElement | null;
    setCurrent(opts);
  }, []);

  const close = useCallback(() => {
    setCurrent(null);
    const el = returnFocus.current;
    returnFocus.current = null;
    el?.focus?.();
  }, []);

  // Focus the primary (else last) button whenever an alert opens or is replaced.
  useEffect(() => {
    if (!current) return;
    const box = buttonsRef.current;
    const target =
      box?.querySelector<HTMLElement>(".default") ?? (box?.lastElementChild as HTMLElement | null);
    target?.focus();
  }, [current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, close]);

  const buttons = current?.buttons ?? DEFAULT_BUTTONS;
  const value = useMemo(() => show, [show]);

  return (
    <ShowCtx.Provider value={value}>
      <OpenCtx.Provider value={open}>
        {children}
        {current && (
          <div className="alert-layer">
            <div
              className="alert bevel"
              role="alertdialog"
              aria-modal="true"
              aria-describedby="alert-body"
            >
              <PixelIcon name={current.icon} size={40} />
              <div className="alert-main">
                <div id="alert-body">{current.body}</div>
                <div className="alert-buttons" ref={buttonsRef}>
                  {buttons.map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      className={b.primary ? "pbtn default" : "pbtn"}
                      onClick={() => {
                        close();
                        b.run?.();
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </OpenCtx.Provider>
    </ShowCtx.Provider>
  );
}

export function useAlert(): (opts: AlertOptions) => void {
  return useContext(ShowCtx);
}

export function useAlertOpen(): boolean {
  return useContext(OpenCtx);
}
