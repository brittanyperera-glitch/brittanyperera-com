import { type ReactElement, useId } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import type { IconName } from "@/lib/types";
import { ART, type ArtName } from "./art";

/** Names drawn as 32px SVG art. Every other IconName falls back to its pixel bitmap. */
export const MAC_ICON_NAMES = Object.keys(ART) as ArtName[];

function isArt(name: IconName): name is ArtName {
  return name in ART;
}

/**
 * The 32px Platinum icon set from the approved polish mockup: original drawings, 1px dark outline,
 * light from the top left. Gradient ids are scoped per instance so an icon still paints when a
 * sibling copy sits inside a hidden (display:none) window.
 */
export function MacIcon({
  name,
  size = 32,
  label,
}: {
  name: IconName;
  size?: number;
  label?: string;
}): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!isArt(name)) return <PixelIcon name={name} size={size} label={label} />;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none" as const,
    strokeWidth: 1,
  };
  if (label) {
    return (
      <svg {...common} role="img">
        <title>{label}</title>
        {ART[name](uid)}
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      {ART[name](uid)}
    </svg>
  );
}
