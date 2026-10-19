import { PixelIcon } from "@/components/PixelIcon";
import { copy } from "@/content/copy";
import type { IconName } from "@/lib/types";

/** The project icons that march along the bottom of the splash, one every 220ms. */
export const BOOT_ICONS: IconName[] = [
  "mac",
  "doc",
  "folder",
  "palm",
  "heart",
  "film",
  "gift",
  "passport",
  "palette",
];

// A single button so a click, Enter or Space anywhere skips. Only phrasing content inside it.
export function Boot({
  phase,
  marched,
  onSkip,
}: {
  phase: "boot" | "splash";
  marched: number;
  onSkip: () => void;
}) {
  const pct = Math.round((marched / BOOT_ICONS.length) * 100);
  return (
    <button type="button" className="boot" data-phase={phase} onClick={onSkip}>
      {phase === "boot" ? (
        <span className="happy">
          <PixelIcon name="happymac" size={64} />
        </span>
      ) : (
        <span className="splash bevel">
          <PixelIcon name="mac" size={48} />
          <span className="boot-name">{copy.boot.name}</span>
          <span className="boot-status">{copy.boot.status}</span>
          <span className="bar">
            <span style={{ width: `${pct}%` }} />
          </span>
        </span>
      )}
      <span className="extensions">
        {BOOT_ICONS.slice(0, marched).map((name) => (
          <PixelIcon key={name} name={name} size={32} />
        ))}
      </span>
      <span className="boot-hint">{copy.boot.hint}</span>
    </button>
  );
}
