import { PALETTE } from "@/lib/pixel/icons";

const PIN: string[] = [".kkk.", "krrrk", "krwrk", "krrrk", ".krk.", "..k.."];

const RECTS = PIN.flatMap((line, y) =>
  [...line].flatMap((ch, x) => (ch === "." ? [] : [{ id: `${x}-${y}`, x, y, fill: PALETTE[ch] }])),
);

export function PixelPin() {
  return (
    <svg viewBox="0 0 5 6" aria-hidden="true" focusable="false">
      {RECTS.map((r) => (
        <rect key={r.id} x={r.x} y={r.y} width={1} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
