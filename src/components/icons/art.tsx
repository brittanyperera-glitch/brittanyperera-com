import type { ReactElement } from "react";

// Original drawings on a 32px grid: 1px #1b1b1b outline, light from the top left, half-pixel
// coordinates so strokes land on whole pixels. Each entry gets a per-instance id prefix `p`.
const INK = "#1b1b1b";

type Art = (p: string) => ReactElement;

function Grad({
  id,
  p,
  stops,
  x2 = 0,
  y2 = 1,
}: {
  id: string;
  p: string;
  stops: [number, string][];
  x2?: number;
  y2?: number;
}) {
  return (
    <linearGradient id={`${p}${id}`} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}

function Radial({
  id,
  p,
  cx = 0.4,
  cy = 0.35,
  r = 0.75,
  stops,
}: {
  id: string;
  p: string;
  cx?: number;
  cy?: number;
  r?: number;
  stops: [number, string][];
}) {
  return (
    <radialGradient id={`${p}${id}`} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </radialGradient>
  );
}

const u = (p: string, id: string) => `url(#${p}${id})`;

function mix(hex: string, to: string, t: number): string {
  const a = Number.parseInt(hex.slice(1), 16);
  const b = Number.parseInt(to.slice(1), 16);
  const m = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
}

const BLOCK: Record<string, string> = {
  O: "#d8b545",
  T: "#6e55a8",
  Z: "#b8475f",
  L: "#c9772f",
};

function Block({ x, y, s, k }: { x: number; y: number; s: number; k: keyof typeof BLOCK }) {
  const c = BLOCK[k];
  const b = 1;
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill={c} />
      <polygon
        points={`${x},${y} ${x + s},${y} ${x + s - b},${y + b} ${x + b},${y + b} ${x + b},${y + s - b} ${x},${y + s}`}
        fill={mix(c, "#ffffff", 0.5)}
      />
      <polygon
        points={`${x + s},${y} ${x + s},${y + s} ${x},${y + s} ${x + b},${y + s - b} ${x + s - b},${y + s - b} ${x + s - b},${y + b}`}
        fill={mix(c, "#000000", 0.42)}
      />
      <rect x={x} y={y} width={s} height={s} stroke="#0b0f18" strokeWidth={0.6} />
    </g>
  );
}

const GAME_BLOCKS: [number, number, string][] = [
  [1, 0, "T"],
  [0, 1, "T"],
  [1, 1, "T"],
  [2, 1, "T"],
  [3, 1, "L"],
  [3, 2, "L"],
  [3, 3, "L"],
  [2, 3, "L"],
  [0, 2, "O"],
  [1, 2, "O"],
  [0, 3, "O"],
  [1, 3, "O"],
  [2, 2, "Z"],
];

function Folder({ p }: { p: string }): ReactElement {
  return (
    <>
      <defs>
        <Grad
          id="FolderBack"
          p={p}
          stops={[
            [0, "#a9a9f2"],
            [1, "#7676d0"],
          ]}
        />
        <Grad
          id="FolderFront"
          p={p}
          x2={0.35}
          stops={[
            [0, "#d4d4ff"],
            [0.55, "#a7a7f2"],
            [1, "#8484da"],
          ]}
        />
      </defs>
      <path
        d="M2.5 27.5V7.5L4.5 5.5H12.5L14.5 7.5H29.5V27.5Z"
        fill={u(p, "FolderBack")}
        stroke={INK}
        strokeLinejoin="round"
      />
      <path d="M3.5 8.5H28.5" stroke="#d6d6ff" />
      <path d="M2.5 27.5V11.5H29.5V27.5Z" fill={u(p, "FolderFront")} stroke={INK} />
      <path d="M3.5 12.5H28.5" stroke="#f0f0ff" />
      <path d="M3.5 26.5H28.5" stroke="#6464bd" />
    </>
  );
}

const doc: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Paper"
        p={p}
        x2={1}
        stops={[
          [0, "#ffffff"],
          [1, "#d9dbe0"],
        ]}
      />
      <Grad
        id="Ear"
        p={p}
        x2={1}
        stops={[
          [0, "#f4f4f4"],
          [1, "#a9adb6"],
        ]}
      />
    </defs>
    <path d="M6.5 2.5H20.5L26.5 8.5V29.5H6.5Z" fill={u(p, "Paper")} stroke={INK} />
    <path d="M7.5 3.5V28.5" stroke="#fff" strokeOpacity={0.9} />
    <path d="M20.5 2.5V8.5H26.5" fill={u(p, "Ear")} stroke={INK} strokeLinejoin="round" />
    <rect x="9" y="6" width="9" height="3" fill="#3d6fb6" />
    <rect x="9" y="6" width="9" height="1" fill="#7fa3d8" />
    <rect x="9" y="11" width="14" height="1" fill="#8d93a0" />
    <rect x="9" y="13" width="12" height="1" fill="#b2b7c2" />
    <rect x="9" y="16" width="5" height="1" fill="#3d6fb6" />
    <rect x="9" y="18" width="15" height="1" fill="#8d93a0" />
    <rect x="9" y="20" width="13" height="1" fill="#b2b7c2" />
    <rect x="9" y="22" width="14" height="1" fill="#b2b7c2" />
    <rect x="9" y="25" width="5" height="1" fill="#3d6fb6" />
    <rect x="9" y="27" width="11" height="1" fill="#b2b7c2" />
  </>
);

const game: Art = () => (
  <>
    <rect x="2.5" y="4.5" width="27" height="25" rx="3" fill="#1d2536" stroke={INK} />
    <rect x="3.5" y="5.5" width="25" height="23" rx="2" stroke="#3a4766" />
    {GAME_BLOCKS.map(([c, r, k]) => (
      <Block key={`${c}-${r}`} x={5 + c * 5.5} y={7 + r * 5.5} s={5.5} k={k} />
    ))}
  </>
);

const folder: Art = (p) => <Folder p={p} />;

const musicfolder: Art = (p) => (
  <>
    <Folder p={p} />
    <g transform="translate(1 1)" fill="#eeeeff" stroke="#eeeeff" opacity={0.85}>
      <path d="M13 15.5L20 14V22" strokeWidth={1.6} />
      <path d="M13 15.5V23" strokeWidth={1.6} />
      <ellipse cx="11.3" cy="23.3" rx="2.3" ry="1.7" stroke="none" />
      <ellipse cx="18.3" cy="22.3" rx="2.3" ry="1.7" stroke="none" />
    </g>
    <g fill="#4d4da8" stroke="#4d4da8">
      <path d="M13 15.5L20 14V22" strokeWidth={1.6} />
      <path d="M13 15.5V23" strokeWidth={1.6} />
      <path d="M13 15.5L20 14V16L13 17.5Z" stroke="none" />
      <ellipse cx="11.3" cy="23.3" rx="2.3" ry="1.7" stroke="none" />
      <ellipse cx="18.3" cy="22.3" rx="2.3" ry="1.7" stroke="none" />
    </g>
  </>
);

const camera: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Metal"
        p={p}
        stops={[
          [0, "#fbfbfb"],
          [0.5, "#d0d0d0"],
          [1, "#8f8f8f"],
        ]}
      />
      <Radial
        id="Lens"
        p={p}
        cx={0.38}
        r={0.75}
        stops={[
          [0, "#7d9fd0"],
          [0.45, "#2c4672"],
          [1, "#05080f"],
        ]}
      />
    </defs>
    <path
      d="M10.5 10.5V7.5L12.5 5.5H19.5L21.5 7.5V10.5Z"
      fill={u(p, "Metal")}
      stroke={INK}
      strokeLinejoin="round"
    />
    <rect x="2.5" y="10.5" width="27" height="17" rx="2.5" fill={u(p, "Metal")} stroke={INK} />
    <rect x="3.5" y="14.5" width="25" height="9" fill="#3b3b3e" />
    <path d="M3.5 14.5H28.5" stroke="#1f1f22" />
    <path d="M3.5 23.5H28.5" stroke="#6b6b70" />
    <path d="M4 11.5H28" stroke="#fff" />
    <rect x="5.5" y="8.5" width="3" height="2" fill="#c9773f" stroke={INK} strokeWidth={0.8} />
    <rect x="22.5" y="11.5" width="5" height="2.5" fill="#fffbe6" stroke={INK} strokeWidth={0.8} />
    <circle cx="16" cy="19" r="7" fill="#dcdcdc" stroke={INK} />
    <circle cx="16" cy="19" r="5.6" fill="#2a2a2d" />
    <circle cx="16" cy="19" r="4.3" fill={u(p, "Lens")} />
    <ellipse cx="14.4" cy="17.3" rx="1.6" ry="1.1" fill="#fff" opacity={0.85} />
    <circle cx="17.8" cy="20.8" r=".7" fill="#9fc0ee" opacity={0.7} />
  </>
);

// A generic portable TV with a play triangle. It stands for the YouTube window without borrowing its logo.
const play: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Tv"
        p={p}
        x2={1}
        stops={[
          [0, "#f2f2f2"],
          [0.6, "#c3c3c3"],
          [1, "#858585"],
        ]}
      />
      <Radial
        id="Screen"
        p={p}
        r={0.85}
        stops={[
          [0, "#7f9fd4"],
          [0.6, "#34508a"],
          [1, "#14203b"],
        ]}
      />
    </defs>
    <path d="M12.5 7.5L9 2.5M19.5 7.5L23 2.5" stroke={INK} strokeLinecap="round" />
    <circle cx="9" cy="2.5" r="1" fill={INK} />
    <circle cx="23" cy="2.5" r="1" fill={INK} />
    <rect x="2.5" y="7.5" width="27" height="19" rx="3" fill={u(p, "Tv")} stroke={INK} />
    <path d="M4 9H28" stroke="#fff" />
    <rect x="5.5" y="10.5" width="16" height="13" rx="2.5" fill={u(p, "Screen")} stroke={INK} />
    <path d="M7 12.5Q9 11.6 13 11.7" stroke="#fff" strokeOpacity={0.45} />
    <path
      d="M11.5 13.5L17.5 17L11.5 20.5Z"
      fill="#fff"
      stroke="#14203b"
      strokeWidth={0.6}
      strokeLinejoin="round"
    />
    <circle cx="25.5" cy="13" r="1.8" fill="#5a5a5a" stroke={INK} strokeWidth={0.7} />
    <circle cx="25.5" cy="17.5" r="1.8" fill="#5a5a5a" stroke={INK} strokeWidth={0.7} />
    <path d="M23.5 21H27.5M23.5 22.5H27.5" stroke="#6a6a6a" />
    <rect x="6.5" y="26.5" width="4" height="2" fill="#4a4a4a" stroke={INK} strokeWidth={0.7} />
    <rect x="21.5" y="26.5" width="4" height="2" fill="#4a4a4a" stroke={INK} strokeWidth={0.7} />
  </>
);

const mail: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Env"
        p={p}
        stops={[
          [0, "#fffdf4"],
          [1, "#ddd5bd"],
        ]}
      />
      <Grad
        id="Flap"
        p={p}
        stops={[
          [0, "#f1ead3"],
          [1, "#c9bf9f"],
        ]}
      />
      <Radial
        id="Seal"
        p={p}
        r={0.7}
        stops={[
          [0, "#e17d92"],
          [1, "#8d2c42"],
        ]}
      />
    </defs>
    <rect x="2.5" y="8.5" width="27" height="18" fill={u(p, "Env")} stroke={INK} />
    <path d="M3 26L13.5 17.5M29 26L18.5 17.5" stroke="#a69d82" />
    <path d="M2.5 8.5L16 19L29.5 8.5Z" fill={u(p, "Flap")} stroke={INK} strokeLinejoin="round" />
    <path d="M4.5 9.5L16 18.2" stroke="#fff" strokeOpacity={0.8} />
    <circle cx="16" cy="18" r="3" fill={u(p, "Seal")} stroke="#5e1a2a" strokeWidth={0.8} />
    <circle cx="15.2" cy="17.2" r=".9" fill="#fff" opacity={0.6} />
  </>
);

const trash: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Can"
        p={p}
        x2={1}
        y2={0}
        stops={[
          [0, "#8d8d8d"],
          [0.28, "#f3f3f3"],
          [0.6, "#bdbdbd"],
          [1, "#6c6c6c"],
        ]}
      />
      <Grad
        id="Lid"
        p={p}
        stops={[
          [0, "#fafafa"],
          [1, "#a3a3a3"],
        ]}
      />
    </defs>
    <path d="M13.5 6.5V4.5Q13.5 3.5 14.5 3.5H17.5Q18.5 3.5 18.5 4.5V6.5" stroke={INK} />
    <path
      d="M7.5 10.5L9.5 29.5H22.5L24.5 10.5Z"
      fill={u(p, "Can")}
      stroke={INK}
      strokeLinejoin="round"
    />
    <path d="M12.5 13L13 27M16 13V27M19.5 13L19 27" stroke="#5f5f5f" />
    <path d="M13.5 13L14 27M17 13V27" stroke="#fff" strokeOpacity={0.7} />
    <rect x="5.5" y="6.5" width="21" height="4" rx="1" fill={u(p, "Lid")} stroke={INK} />
    <path d="M7 7.5H25" stroke="#fff" />
  </>
);

const heart: Art = (p) => (
  <>
    <defs>
      <Radial
        id="Heart"
        p={p}
        cx={0.35}
        cy={0.3}
        r={0.9}
        stops={[
          [0, "#f6a6b8"],
          [0.5, "#cf4f6e"],
          [1, "#7d2339"],
        ]}
      />
    </defs>
    <path
      d="M16 28.5L5.2 17.4C1.8 13.8 3.4 6.5 9.6 6.5C12.6 6.5 14.7 8.2 16 10.6C17.3 8.2 19.4 6.5 22.4 6.5C28.6 6.5 30.2 13.8 26.8 17.4Z"
      fill={u(p, "Heart")}
      stroke={INK}
      strokeLinejoin="round"
    />
    <path d="M6.5 11.5Q8 8.2 11 8.2" stroke="#fff" strokeOpacity={0.8} strokeLinecap="round" />
    <path d="M9 16.6L16 25" stroke="#7d2339" strokeOpacity={0.4} />
  </>
);

const palm: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Sand"
        p={p}
        stops={[
          [0, "#f2dfa8"],
          [1, "#c9a86a"],
        ]}
      />
      <Grad
        id="Frond"
        p={p}
        x2={1}
        stops={[
          [0, "#98c46a"],
          [1, "#4d7a32"],
        ]}
      />
    </defs>
    <path
      d="M3.5 28.5Q16 20.5 28.5 28.5Z"
      fill={u(p, "Sand")}
      stroke={INK}
      strokeLinejoin="round"
    />
    <path
      d="M15 25.2Q16.6 18 15.2 11.2L17.8 11Q19 18.6 17.4 25Z"
      fill="#b07a45"
      stroke={INK}
      strokeLinejoin="round"
    />
    <path d="M15.6 22L17.6 21.4M15.9 18.5L17.9 17.9M15.6 15L17.6 14.6" stroke="#6e4723" />
    <g fill={u(p, "Frond")} stroke={INK} strokeLinejoin="round">
      <path d="M16.5 11.2Q10.5 4.6 3.5 8.6Q9.6 7.6 16.5 11.2Z" />
      <path d="M16.5 11.2Q23 4 29 8.4Q22.6 7.8 16.5 11.2Z" />
      <path d="M16.5 11.2Q11 8.8 8.4 13.6Q12.6 10.8 16.5 11.2Z" />
      <path d="M16.5 11.2Q22.2 8.6 24.6 13.8Q20.6 10.8 16.5 11.2Z" />
      <path d="M16.5 11.2Q15 6.2 17.6 2.6Q18.6 7.2 16.5 11.2Z" />
    </g>
    <circle cx="15.6" cy="12.6" r="1.4" fill="#8a5a2c" stroke={INK} strokeWidth={0.8} />
    <circle cx="18" cy="12.8" r="1.3" fill="#8a5a2c" stroke={INK} strokeWidth={0.8} />
  </>
);

const guitar: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Burst"
        p={p}
        x2={1}
        stops={[
          [0, "#f2b45a"],
          [0.55, "#c9622a"],
          [1, "#6e2410"],
        ]}
      />
    </defs>
    <g transform="rotate(38 16 16)">
      <rect x="14.2" y="1.5" width="3.6" height="5" rx="0.8" fill="#4a2f1c" stroke={INK} />
      <rect x="15" y="6" width="2" height="12" fill="#c9a06a" stroke={INK} />
      <path
        d="M16 16.5C13 13.6 7 14.2 6.8 19.4C6.7 22.4 9 22.6 8.6 25.4C8.2 28.8 12 30.5 16 30.5C20 30.5 23.8 28.8 23.4 25.4C23 22.6 25.3 22.4 25.2 19.4C25 14.2 19 13.6 16 16.5Z"
        fill={u(p, "Burst")}
        stroke={INK}
        strokeLinejoin="round"
      />
      <path
        d="M10.6 17.4Q9 18.4 9.2 20.8"
        stroke="#fff"
        strokeOpacity={0.6}
        strokeLinecap="round"
      />
      <rect x="11.5" y="20" width="9" height="2" fill="#2a2a2d" stroke={INK} strokeWidth={0.6} />
      <rect x="11.5" y="23.6" width="9" height="2" fill="#2a2a2d" stroke={INK} strokeWidth={0.6} />
      <rect x="12" y="27.2" width="8" height="1.6" fill="#d9d9d9" stroke={INK} strokeWidth={0.6} />
      <path d="M15.6 6.5V27M16.4 6.5V27" stroke="#e6e6e6" strokeWidth={0.4} />
    </g>
  </>
);

const piano: Art = (p) => {
  const key = 27 / 7;
  return (
    <>
      <defs>
        <Grad
          id="Case"
          p={p}
          stops={[
            [0, "#5a5a63"],
            [0.4, "#2c2c33"],
            [1, "#17171b"],
          ]}
        />
        <Grad
          id="Keys"
          p={p}
          stops={[
            [0, "#ffffff"],
            [1, "#dcdcdc"],
          ]}
        />
      </defs>
      <path d="M2.5 18.5V8.5L5.5 5.5H26.5L29.5 8.5V18.5Z" fill={u(p, "Case")} stroke={INK} />
      <path d="M5.5 6.5H26.5" stroke="#8a8a94" />
      <rect
        x="11"
        y="9.5"
        width="10"
        height="5"
        rx="0.6"
        fill="#f4efe0"
        stroke={INK}
        strokeWidth={0.8}
      />
      <path d="M12.5 11.5H19.5M12.5 13H17.5" stroke="#9a9484" />
      <rect x="2.5" y="18.5" width="27" height="10" fill={u(p, "Keys")} stroke={INK} />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${2.5 + key * i} 18.5V28.5`} stroke="#8a8a8a" />
      ))}
      {[1, 2, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={2.5 + key * i - 1.2}
          y="18.5"
          width="2.4"
          height="6"
          fill="#1f1f24"
          stroke={INK}
          strokeWidth={0.6}
        />
      ))}
    </>
  );
};

const ukulele: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Wood"
        p={p}
        x2={1}
        stops={[
          [0, "#f0cf8e"],
          [0.6, "#d79e4e"],
          [1, "#9c6422"],
        ]}
      />
    </defs>
    <g transform="rotate(-32 16 16)">
      <rect x="14.2" y="1.5" width="3.6" height="4.6" rx="1" fill="#6b4524" stroke={INK} />
      <rect x="15" y="5.5" width="2" height="10" fill="#7b4f28" stroke={INK} />
      <path
        d="M16 14C12.4 11.8 8.4 13.6 8.8 17.6C9 20 10.8 20.5 10.4 23C10 26.6 12.8 29.5 16 29.5C19.2 29.5 22 26.6 21.6 23C21.2 20.5 23 20 23.2 17.6C23.6 13.6 19.6 11.8 16 14Z"
        fill={u(p, "Wood")}
        stroke={INK}
        strokeLinejoin="round"
      />
      <circle cx="16" cy="21" r="3.2" fill="#2a1a0c" stroke={INK} />
      <rect
        x="12.6"
        y="25.4"
        width="6.8"
        height="1.4"
        fill="#4a2f1c"
        stroke={INK}
        strokeWidth={0.6}
      />
      <path d="M15.4 6V25.4M16.6 6V25.4" stroke="#f1f1f1" strokeWidth={0.4} />
      <path d="M11.2 15.8Q9.8 17 10.2 19" stroke="#fff" strokeOpacity={0.6} strokeLinecap="round" />
    </g>
  </>
);

const garage: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Wall"
        p={p}
        x2={1}
        stops={[
          [0, "#f4efe0"],
          [1, "#cfc8b2"],
        ]}
      />
      <Grad
        id="Roof"
        p={p}
        stops={[
          [0, "#d76a82"],
          [1, "#8d2c42"],
        ]}
      />
      <Grad
        id="Door"
        p={p}
        x2={1}
        stops={[
          [0, "#f2f2f2"],
          [0.55, "#c9c9c9"],
          [1, "#8f8f8f"],
        ]}
      />
    </defs>
    <rect x="3.5" y="12.5" width="25" height="16" fill={u(p, "Wall")} stroke={INK} />
    <path d="M1.5 13.5L16 4.5L30.5 13.5Z" fill={u(p, "Roof")} stroke={INK} strokeLinejoin="round" />
    <path d="M5 13L16 6.2" stroke="#fff" strokeOpacity={0.55} />
    <path
      d="M16.4 7.6V10.4M16.4 7.6L18.8 7.2V9.8"
      stroke="#fff"
      strokeWidth={0.9}
      strokeLinecap="round"
    />
    <ellipse cx="15.6" cy="10.5" rx="1.1" ry="0.8" fill="#fff" />
    <ellipse cx="18" cy="10" rx="1.1" ry="0.8" fill="#fff" />
    <rect x="7.5" y="16.5" width="17" height="12" fill={u(p, "Door")} stroke={INK} />
    <path d="M7.5 19.5H24.5M7.5 22.5H24.5M7.5 25.5H24.5" stroke="#6f6f6f" />
    <path d="M8.5 17.5H23.5" stroke="#fff" />
    <rect x="14" y="26.5" width="4" height="1.2" fill="#4a4a4a" />
  </>
);

const globe: Art = (p) => (
  <>
    <defs>
      <Radial
        id="Sea"
        p={p}
        cx={0.36}
        cy={0.32}
        r={0.85}
        stops={[
          [0, "#a9c8f4"],
          [0.5, "#3d6fb6"],
          [1, "#1b3a73"],
        ]}
      />
      <clipPath id={`${p}Clip`}>
        <circle cx="16" cy="16" r="12.5" />
      </clipPath>
    </defs>
    <circle cx="16" cy="16" r="12.5" fill={u(p, "Sea")} />
    <g clipPath={u(p, "Clip")}>
      <path
        d="M8 7.5Q12 6 15 8.5Q17 11 14 12.5Q15 15 12 16Q10 18 11 21Q9 20 7.5 17Q5 13 8 7.5Z"
        fill="#6f9a4a"
        stroke="#3b5a26"
        strokeWidth={0.6}
      />
      <path
        d="M19 14Q23 12.5 26 15Q28 18 25 21Q23 24 21 23Q19.5 20 19 17Z"
        fill="#6f9a4a"
        stroke="#3b5a26"
        strokeWidth={0.6}
      />
      <path d="M3.5 16H28.5M16 3.5V28.5" stroke="#fff" strokeOpacity={0.22} />
      <ellipse cx="16" cy="16" rx="6" ry="12.5" stroke="#fff" strokeOpacity={0.22} />
    </g>
    <circle cx="16" cy="16" r="12.5" stroke={INK} />
    <ellipse
      cx="11.6"
      cy="10.2"
      rx="4"
      ry="2.4"
      fill="#fff"
      opacity={0.45}
      transform="rotate(-35 11.6 10.2)"
    />
  </>
);

const caution: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Warn"
        p={p}
        x2={0.4}
        stops={[
          [0, "#fff3a8"],
          [0.55, "#f5c518"],
          [1, "#c68a00"],
        ]}
      />
    </defs>
    <path
      d="M16 3.5L29.5 27.5H2.5Z"
      fill={u(p, "Warn")}
      stroke={INK}
      strokeLinejoin="round"
      strokeWidth={1.2}
    />
    <path d="M16 6.4L5 25.8" stroke="#fff" strokeOpacity={0.7} />
    <path d="M14.2 11H17.8L17.2 19.2H14.8Z" fill={INK} />
    <rect x="14.4" y="21" width="3.2" height="3" fill={INK} />
  </>
);

const note: Art = (p) => (
  <>
    <defs>
      <Radial
        id="Bubble"
        p={p}
        cx={0.35}
        cy={0.3}
        r={0.9}
        stops={[
          [0, "#a9c8f4"],
          [0.55, "#3d6fb6"],
          [1, "#24467d"],
        ]}
      />
    </defs>
    <path
      d="M5.5 4.5H26.5Q29.5 4.5 29.5 7.5V19.5Q29.5 22.5 26.5 22.5H15L8.5 28.5V22.5H5.5Q2.5 22.5 2.5 19.5V7.5Q2.5 4.5 5.5 4.5Z"
      fill={u(p, "Bubble")}
      stroke={INK}
      strokeLinejoin="round"
    />
    <path d="M5 6.5H26" stroke="#fff" strokeOpacity={0.6} />
    <circle cx="16" cy="9.6" r="1.8" fill="#fff" />
    <rect x="14.4" y="12.8" width="3.2" height="7" fill="#fff" />
  </>
);

const bomb: Art = (p) => (
  <>
    <defs>
      <Radial
        id="Bomb"
        p={p}
        cx={0.35}
        cy={0.3}
        r={0.8}
        stops={[
          [0, "#8a8a92"],
          [0.4, "#2f2f35"],
          [1, "#050507"],
        ]}
      />
    </defs>
    <path d="M20.5 8.5Q23 5.5 26 6.5" stroke="#6e4a22" strokeWidth={2} strokeLinecap="round" />
    <path d="M20.5 8.5Q23 5.5 26 6.5" stroke={INK} strokeWidth={0.6} strokeLinecap="round" />
    <circle cx="16" cy="19" r="10.5" fill={u(p, "Bomb")} stroke={INK} />
    <rect
      x="17"
      y="6.8"
      width="6"
      height="4"
      rx="1"
      fill="#6a6a72"
      stroke={INK}
      transform="rotate(35 20 8.8)"
    />
    <path
      d="M26 6.5L27.6 3.6M26 6.5L29.2 6.9M26 6.5L28 9M26 6.5L24.4 3.9"
      stroke="#f5c518"
      strokeLinecap="round"
    />
    <circle cx="26" cy="6.5" r="1.4" fill="#fff3a8" />
    <ellipse
      cx="11.6"
      cy="14.4"
      rx="3"
      ry="1.8"
      fill="#fff"
      opacity={0.5}
      transform="rotate(-35 11.6 14.4)"
    />
  </>
);

const mac: Art = (p) => (
  <>
    <defs>
      <Grad
        id="Case"
        p={p}
        x2={1}
        stops={[
          [0, "#fafafa"],
          [1, "#bdbdbd"],
        ]}
      />
      <Radial
        id="Screen"
        p={p}
        r={0.85}
        stops={[
          [0, "#7f9fd4"],
          [0.6, "#34508a"],
          [1, "#14203b"],
        ]}
      />
    </defs>
    <g transform="translate(3 1) scale(1.857)">
      <rect
        x=".5"
        y=".5"
        width="13"
        height="15"
        rx="1.5"
        fill={u(p, "Case")}
        stroke={INK}
        strokeWidth={0.5}
      />
      <rect
        x="2.3"
        y="2.3"
        width="9.4"
        height="7.2"
        rx=".6"
        fill={u(p, "Screen")}
        stroke={INK}
        strokeWidth={0.4}
      />
      <path
        d="M5 4.6V5.8M9 4.6V5.8M5.3 7.6Q7 8.7 8.7 7.6"
        stroke="#fff"
        strokeWidth={0.5}
        strokeLinecap="round"
      />
      <path d="M3 12.6H6" stroke={INK} strokeWidth={0.5} />
      <path d="M9 12.6H11" stroke="#9a9a9a" strokeWidth={0.7} />
    </g>
  </>
);

export const ART = {
  doc,
  game,
  folder,
  musicfolder,
  camera,
  play,
  mail,
  trash,
  heart,
  palm,
  guitar,
  piano,
  ukulele,
  garage,
  globe,
  caution,
  note,
  bomb,
  mac,
} satisfies Record<string, Art>;

export type ArtName = keyof typeof ART;
