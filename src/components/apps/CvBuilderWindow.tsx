"use client";

import { useEffect, useReducer } from "react";
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

type Props = {
  /** Test seam: a ready-made game in place of the default first game. */
  startGame?: () => Game;
};

export function CvBuilderWindow({ startGame }: Props) {
  const { state, actions } = useDesktop();
  const alert = useAlert();
  const alertOpen = useAlertOpen();
  const [game, dispatch] = useReducer(gameReducer, undefined, () => startGame?.() ?? newGame());

  const isOpen = state.open.includes("cvbuilder");
  const isFront = isOpen && topWindow(state) === "cvbuilder";
  const active = isFront && !alertOpen && game.status === "playing";

  // The window stays mounted when closed, so the game keeps its progress; only the board is dropped.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const action = KEYS[e.key];
      if (!action || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      dispatch({ type: action } as GameAction);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), gravityMs(game.lines));
    return () => window.clearInterval(id);
  }, [active, game.lines]);

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
  }, [game.status, alert, download]);

  return (
    <>
      <h3 className={isOpen ? "cvb-title" : undefined}>{cvBuilder.title}</h3>
      {isOpen ? (
        <GameView
          game={game}
          paused={!isFront}
          phone={state.mode === "phone"}
          dispatch={dispatch}
        />
      ) : null}
    </>
  );
}
