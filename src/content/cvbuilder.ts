// Approved by Brittany 2026-10-19.
import data from "./cv-data.json";

const years = (dates: string) => dates.match(/\d{4}/g) ?? [];
// "Oct 2023 to Jun 2024" becomes "2023–24"; a single year stays whole.
const span = (dates: string) => {
  const [from, to] = years(dates);
  return to && to !== from ? `${from}–${to.slice(2)}` : (from ?? "");
};
const role = (org: string) => {
  const r = data.experience.find((e) => e.org.includes(org));
  if (!r) throw new Error(`cv-data.json has no role at ${org}`);
  return r;
};
const playgroundYear =
  data.leadership.map((l) => l.text.match(/playground[^(]*\((\d{4})\)/)?.[1]).find(Boolean) ?? "";

// Panel rows, in the order their pieces fall: the `when` plus a CV line (about 35 characters, so it
// fits three lines under NOW/NEXT).
const timeline = [
  { when: playgroundYear, label: "Built a playground in Sri Lanka" },
  { when: span(data.education[0].dates), label: "Studied engineering at Oxford" },
  { when: span(role("Mercedes").dates), label: "Optimised an F1 car's radiator" },
  { when: span(role("VietJet").dates), label: "ML for jet engines at VietJet" },
  { when: "Now", label: "Satellite AI at PangeAI" },
];

// Pieces after the timeline keep falling with more lines from the CV, then round again.
const extraLines = [
  "Led a 16-person college committee",
  "Ran a 950-guest May Ball",
  "Taught A-level physics and maths",
  "Raised £20,000+ from donors",
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
  startLabel: "press space to start",
  startLabelPhone: "tap to start",
  openCvLabel: "open my full CV",
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
