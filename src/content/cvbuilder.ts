// Drafts for Brittany's approval.
import { about } from "./about";
import { cv } from "./cv";

// One short label per about.timeline entry, same order; a test keeps the lengths equal.
const timelineLabels = ["playground", "Oxford", "F1", "jet engines", "PangeAI"];

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
  /** Panel rows: about.timeline's `when` plus a short label. */
  entries: about.timeline.map((t, i) => ({ when: t.when, label: timelineLabels[i] ?? "" })),
  /** Falling pieces carry these in order, then the skills, then round again. */
  pieceLabels: [...timelineLabels, ...cv.skills],
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
