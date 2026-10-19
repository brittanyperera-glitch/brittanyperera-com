import { ICONS, PALETTE } from "@/lib/pixel/icons";
import type { IconName } from "@/lib/types";

type Run = { x: number; y: number; w: number; ch: string };

function runsFor(rows: string[]): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || !(ch in PALETTE)) {
        x += 1;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w += 1;
      runs.push({ x, y, w, ch });
      x += w;
    }
  });
  return runs;
}

export function PixelIcon({
  name,
  size = 32,
  label,
}: {
  name: IconName;
  size?: number;
  label?: string;
}) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      {runsFor(ICONS[name]).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={PALETTE[r.ch]} />
      ))}
    </svg>
  );
}
