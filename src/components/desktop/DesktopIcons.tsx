"use client";

import { useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { useDesktop } from "./Desktop";

export function DesktopIcons() {
  const { open, state } = useDesktop();
  const [selected, setSelected] = useState<WinId | null>(null);
  const phone = state.mode === "phone";

  return (
    <div className="icons">
      {copy.desktopIcons.map((ic) => (
        <button
          key={ic.open}
          type="button"
          className={selected === ic.open ? "icon selected" : "icon"}
          onClick={() => {
            setSelected(ic.open);
            if (phone) open(ic.open);
          }}
          onDoubleClick={() => open(ic.open)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              open(ic.open);
            }
          }}
        >
          <PixelIcon name={ic.icon} size={40} />
          <span className="label">{ic.label}</span>
        </button>
      ))}
    </div>
  );
}
