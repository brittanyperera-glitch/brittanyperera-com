"use client";

import { useState } from "react";
import { useDesktop } from "@/components/desktop/Desktop";
import { IconButton } from "@/components/desktop/IconButton";
import { music } from "@/content/music";

export function MusicWindow() {
  const { open } = useDesktop();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="folder-grid">
      {music.instruments.map((i) => (
        <IconButton
          key={i.id}
          icon={i.icon}
          label={i.name}
          selected={selected === i.id}
          onSelect={() => setSelected(i.id)}
          onOpen={() => open(`music:${i.id}`)}
        />
      ))}
      <IconButton
        icon="garage"
        label={music.appName}
        selected={selected === "garage"}
        onSelect={() => setSelected("garage")}
        onOpen={() => open("garage")}
      />
    </div>
  );
}
