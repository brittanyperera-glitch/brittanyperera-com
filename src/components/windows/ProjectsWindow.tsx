"use client";

import { useState } from "react";
import { useDesktop } from "@/components/desktop/Desktop";
import { IconButton } from "@/components/desktop/IconButton";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";

export function ProjectsWindow() {
  const { open } = useDesktop();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <p className="info">{copy.windows.projectsInfo.replace("{n}", String(projects.length))}</p>
      <div className="folder-grid">
        {projects.map((p) => (
          <IconButton
            key={p.id}
            icon={p.icon}
            label={p.title}
            selected={selected === p.id}
            onSelect={() => setSelected(p.id)}
            onOpen={() => open(`project:${p.id}`)}
          />
        ))}
      </div>
    </>
  );
}
