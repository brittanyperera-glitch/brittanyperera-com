"use client";

import { useState } from "react";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import type { WinId } from "@/lib/types";
import { useDesktop } from "./Desktop";
import { IconButton } from "./IconButton";

const YOUTUBE = "youtube";

export function DesktopIcons() {
  const { open, actions } = useDesktop();
  const [selected, setSelected] = useState<WinId | typeof YOUTUBE | null>(null);
  const youtube = contact.youtube;

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
      {youtube && (
        <IconButton
          icon="play"
          label={contact.youtubeLabel}
          selected={selected === YOUTUBE}
          onSelect={() => setSelected(YOUTUBE)}
          onOpen={() => actions.leave(youtube)}
        />
      )}
    </div>
  );
}
