import { cvBuilder } from "@/content/cvbuilder";
import { createGame, type Game, hardDrop, moveH, rotate, softDrop, tick } from "@/lib/tetris";

export type GameAction =
  | { type: "left" | "right" | "rotate" | "down" | "drop" | "tick" }
  | { type: "restart" };

const FIRST_SEED = 0xc0ffee;

export function newGame(seed = FIRST_SEED): Game {
  return createGame(seed, cvBuilder.pieceLabels, cvBuilder.entries.length);
}

export function gameReducer(g: Game, a: GameAction): Game {
  switch (a.type) {
    case "left":
      return moveH(g, -1);
    case "right":
      return moveH(g, 1);
    case "rotate":
      return rotate(g);
    case "down":
      return softDrop(g);
    case "drop":
      return hardDrop(g);
    case "tick":
      return tick(g);
    case "restart":
      // A fresh bag order each time, still deterministic from the previous state.
      return newGame((Math.imul(g.seed, 1664525) + 1013904223) >>> 0);
  }
}
