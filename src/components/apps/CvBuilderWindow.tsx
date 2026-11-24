"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { useAlert, useAlertOpen } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { cvBuilder } from "@/content/cvbuilder";
import { type Game, gravityMs } from "@/lib/tetris";
import { topWindow } from "@/lib/windows";
import "@/styles/cvbuilder.css";
import { GameView } from "./cvbuilder/GameView";
import { type GameAction, gameReducer, newGame } from "./cvbuilder/gameReducer";

const KEYS: Record<string, GameAction["type"]> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "rotate",
  ArrowDown: "down",
  " ": "drop",
};

const FORM = "input, select, textarea, [contenteditable]:not([contenteditable=false])";
// Space activates these natively, so the game must leave it to them.
const ACTIVATES = "button, a[href], summary, [role=button], [role=menuitem]";

const targetIs = (t: EventTarget | null, selector: string) =>
  t instanceof Element && t.closest(selector) !== null;

type Props = {
  /** Test seam: a ready-made game in place of the default first game. It is already under way. */
  startGame?: () => Game;
};

export function CvBuilderWindow({ startGame }: Props) {
  const { state, actions, open } = useDesktop();
  const alert = useAlert();
  const alertOpen = useAlertOpen();
  const [game, play] = useReducer(gameReducer, undefined, () => startGame?.() ?? newGame());

  // The first piece waits for the first key or click, so a visitor who opened the window by accident
  // does not lose the game while looking elsewhere.
  const [started, setStarted] = useState(startGame !== undefined);

  // A new game holds its first piece again, like the first one.
  const dispatch = useCallback((a: GameAction) => {
    if (a.type === "restart") setStarted(false);
    play(a);
  }, []);

  const isOpen = state.open.includes("cvbuilder");
  const isFront = isOpen && topWindow(state) === "cvbuilder";
  const active = isFront && !alertOpen && game.status === "playing";

  // The window stays mounted when closed, so the game keeps its progress; only the board is dropped.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const action = KEYS[e.key];
      if (!action || e.metaKey || e.ctrlKey || e.altKey) return;
      if (targetIs(e.target, FORM)) return;
      if (e.key === " " && targetIs(e.target, ACTIVATES)) return;
      e.preventDefault();
      setStarted(true);
      // Space starts the game; it does not also drop the first piece.
      if (!started && e.key === " ") return;
      dispatch({ type: action } as GameAction);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, started, dispatch]);

  // A click in the window starts the game too, but a filed row goes to the CV instead.
  useEffect(() => {
    if (!active || started) return;
    const onClick = (e: MouseEvent) => {
      if (
        targetIs(e.target, 'section[data-win="cvbuilder"]') &&
        !targetIs(e.target, ".cvb-entry, .cvb-again")
      )
        setStarted(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [active, started]);

  useEffect(() => {
    if (!active || !started) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), gravityMs(game.lines));
    return () => window.clearInterval(id);
  }, [active, started, game.lines, dispatch]);

  const { download } = actions;
  useEffect(() => {
    if (game.status === "won") {
      alert({
        icon: "note",
        body: cvBuilder.win.text,
        buttons: [{ label: cvBuilder.win.button, primary: true, run: download }],
      });
    } else if (game.status === "lost") {
      alert({
        icon: "caution",
        body: cvBuilder.lose.text,
        buttons: [
          { label: cvBuilder.lose.button, primary: true, run: () => dispatch({ type: "restart" }) },
        ],
      });
    }
  }, [game.status, alert, download, dispatch]);

  return (
    <>
      <h3 className={isOpen ? "cvb-title" : undefined}>{cvBuilder.title}</h3>
      {isOpen ? (
        <GameView
          game={game}
          paused={!isFront}
          waiting={!started}
          onOpenCv={() => open("cv")}
          phone={state.mode === "phone"}
          dispatch={dispatch}
        />
      ) : null}
    </>
  );
}
