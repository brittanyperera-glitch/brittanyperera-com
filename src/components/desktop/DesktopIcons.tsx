"use client";

import { useState } from "react";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { useDesktop } from "./Desktop";
import { IconButton } from "./IconButton";

export function DesktopIcons() {
  const { open } = useDesktop();
  const [selected, setSelected] = useState<WinId | null>(null);

  return (
    <div className="icons">
      {copy.desktopIcons.map((ic) => (
        <IconButton
          key={ic.open}
          icon={ic.icon}
          label={ic.label}
          openId={ic.open}
          selected={selected === ic.open}
          onSelect={() => setSelected(ic.open)}
          onOpen={() => open(ic.open)}
        />
      ))}
    </div>
  );
}
