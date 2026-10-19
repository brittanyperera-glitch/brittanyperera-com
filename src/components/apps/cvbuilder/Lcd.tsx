// Seven-segment readout. Unlit segments stay on screen as faint ghosts, like a real LCD.
const SEGS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  " ": "",
};

const W = 13;
const H = 24;
const T = 3;
const GAP = 0.7;
const ADVANCE = W + 5;

const hz = (x: number, y: number, len: number) =>
  `${x},${y} ${x + T / 2},${y - T / 2} ${x + len - T / 2},${y - T / 2} ${x + len},${y} ${x + len - T / 2},${y + T / 2} ${x + T / 2},${y + T / 2}`;
const vt = (x: number, y: number, len: number) =>
  `${x},${y} ${x + T / 2},${y + T / 2} ${x + T / 2},${y + len - T / 2} ${x},${y + len} ${x - T / 2},${y + len - T / 2} ${x - T / 2},${y + T / 2}`;

function digit(ch: string, x: number) {
  const L = x + T / 2;
  const R = x + W - T / 2;
  const top = T / 2;
  const mid = H / 2;
  const bot = H - T / 2;
  const shapes: Record<string, string> = {
    a: hz(L + GAP, top, R - L - 2 * GAP),
    g: hz(L + GAP, mid, R - L - 2 * GAP),
    d: hz(L + GAP, bot, R - L - 2 * GAP),
    f: vt(L, top + GAP, mid - top - 2 * GAP),
    b: vt(R, top + GAP, mid - top - 2 * GAP),
    e: vt(L, mid + GAP, bot - mid - 2 * GAP),
    c: vt(R, mid + GAP, bot - mid - 2 * GAP),
  };
  const lit = SEGS[ch] ?? "";
  return [..."abcdefg"].map((s) => (
    <polygon key={s} points={shapes[s]} className={lit.includes(s) ? "on" : "off"} />
  ));
}

/** `digits` is the fixed width, so the ghost segments of unused places stay visible. */
export function Lcd({ value, digits, label }: { value: number; digits: number; label: string }) {
  const text = String(Math.min(value, 10 ** digits - 1)).padStart(digits, " ");
  const width = text.length * ADVANCE + 3;
  return (
    <svg
      className="cvb-seg"
      role="img"
      aria-label={label}
      width={width}
      height={H + 1}
      viewBox={`0 0 ${width} ${H + 1}`}
    >
      <g transform={`skewX(-7) translate(${H * 0.13} 0.5)`}>
        {[...text].map((ch, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-width readout, position is identity
          <g key={i}>{digit(ch, i * ADVANCE)}</g>
        ))}
      </g>
    </svg>
  );
}
