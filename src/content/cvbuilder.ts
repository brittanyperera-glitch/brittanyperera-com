// Approved by Brittany 2026-10-19.
import { cv } from "./cv";

// Panel rows, in the order their pieces fall: the `when` plus a short label.
const timeline = [
  { when: "2018", label: "playground" },
  { when: "2020–24", label: "Oxford" },
  { when: "2023–24", label: "F1" },
  { when: "2025", label: "jet engines" },
  { when: "Now", label: "PangeAI" },
];

export const cvBuilder = {
  title: "CV Builder",
  intro:
    "build my cv the only way that makes sense: tetris. every line you clear files one more entry.",
  panelTitle: "CV.doc",
  filedLabel: "filed",
  boardLabel: "tetris board",
  fallingLabel: "now",
  nextLabel: "next",
  scoreLabel: "score",
  linesLabel: "lines",
  pausedLabel: "paused",
  hint: "arrows to move and turn, space to drop it fast",
  entries: timeline,
  /** Falling pieces carry these in order, then the skills, then round again. */
  pieceLabels: [...timeline.map((t) => t.label), ...cv.skills],
  controls: {
    left: { label: "move left", glyph: "←" },
    rotate: { label: "rotate", glyph: "↻" },
    right: { label: "move right", glyph: "→" },
    down: { label: "drop down", glyph: "↓" },
  },
  win: {
    text: "cv complete. every line filed, no gaps. the real pdf is yours.",
    button: "get the pdf",
  },
  lose: {
    text: "the stack hit the ceiling. my cv is still half a cv, so go again?",
    button: "try again",
  },
  again: "play again",
};
