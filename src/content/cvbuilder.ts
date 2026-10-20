// Approved by Brittany 2026-10-19.

// Panel rows, in the order their pieces fall: the `when` plus a CV line (about 35 characters, so it
// fits three lines under NOW/NEXT).
const timeline = [
  { when: "2018", label: "Built a playground in Sri Lanka" },
  { when: "2020–24", label: "Studied engineering at Oxford" },
  { when: "2023–24", label: "Optimised an F1 car's radiator" },
  { when: "2025", label: "ML for jet engines at VietJet" },
  { when: "Now", label: "Satellite AI at PangeAI" },
];

// Pieces after the timeline keep falling with more lines from the CV, then round again.
const extraLines = [
  "Negotiated rent down from 13% to 8%",
  "Ran a ball for 900+ guests",
  "Taught A-level physics and maths",
  "Led a committee of 15",
  "Built end-to-end data pipelines",
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
  /** Falling pieces carry these in order, then round again. */
  pieceLabels: [...timeline.map((t) => t.label), ...extraLines],
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
