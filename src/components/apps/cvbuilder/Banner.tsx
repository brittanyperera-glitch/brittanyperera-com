import { cvBuilder } from "@/content/cvbuilder";
import { PALETTE } from "@/lib/pixel/icons";

// Faint falling-piece silhouettes behind the title: [col, row, palette key].
const GHOSTS: [number, number, string][] = [
  [0, 0, "c"],
  [1, 0, "y"],
  [2, 0, "p"],
  [1, 1, "l"],
  [4, 1, "r"],
  [4, 2, "b"],
  [5, 0, "o"],
  [5, 1, "c"],
  [8, 0, "y"],
  [8, 1, "p"],
  [8, 2, "l"],
  [9, 2, "r"],
];
const S = 18;
const B = 1.4;

function Ghost({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width={S} height={S} fill={fill} />
      <polygon
        points={`${x},${y} ${x + S},${y} ${x + S - B},${y + B} ${x + B},${y + B} ${x + B},${y + S - B} ${x},${y + S}`}
        fill="#fff"
        fillOpacity={0.5}
      />
      <polygon
        points={`${x + S},${y} ${x + S},${y + S} ${x},${y + S} ${x + B},${y + S - B} ${x + S - B},${y + S - B} ${x + S - B},${y + B}`}
        fill="#000"
        fillOpacity={0.42}
      />
    </g>
  );
}

export function Banner() {
  return (
    <div className="cvb-banner">
      <svg className="cvb-ghosts" width="190" height="90" aria-hidden="true">
        {GHOSTS.map(([c, r, k]) => (
          <Ghost key={`${c},${r}`} x={c * S} y={r * S} fill={PALETTE[k]} />
        ))}
      </svg>
      <svg className="cvb-logo" width="300" height="40" viewBox="0 0 300 40" aria-hidden="true">
        <defs>
          <linearGradient id="cvb-logo-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.48" stopColor="#cfdcf3" />
            <stop offset="0.52" stopColor="#7f9ccf" />
            <stop offset="1" stopColor="#c3d3f0" />
          </linearGradient>
        </defs>
        <text x="3" y="33" className="cvb-logo-text" fill="#05080f" opacity="0.85">
          {cvBuilder.title}
        </text>
        <text
          x="1"
          y="31"
          className="cvb-logo-text"
          fill="url(#cvb-logo-grad)"
          stroke="#0a1224"
          strokeWidth="1.4"
          paintOrder="stroke"
        >
          {cvBuilder.title}
        </text>
      </svg>
      <p>{cvBuilder.intro}</p>
    </div>
  );
}
