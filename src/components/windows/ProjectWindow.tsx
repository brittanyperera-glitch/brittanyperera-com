"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import type { Project } from "@/content/projects";

export function ProjectWindow({ project }: { project: Project }) {
  const { actions } = useDesktop();
  const { embed, link } = project;
  return (
    <>
      <h3>{project.title}</h3>
      <p>{project.blurb}</p>
      {embed && (
        <div className="shot well">
          <p className="info">{embed.note}</p>
          <iframe
            title={project.title}
            src={embed.url}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      )}
      <p>
        {project.tags.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </p>
      {link && (
        <p>
          <button type="button" className="pbtn" onClick={() => actions.leave(link.href)}>
            {link.label}
          </button>
        </p>
      )}
    </>
  );
}
