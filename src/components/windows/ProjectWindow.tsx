"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { type Project, projectUi } from "@/content/projects";

// A SimpleText-style read-me; its one button opens the site in the browser window.
export function ProjectWindow({ project }: { project: Project }) {
  const { open } = useDesktop();
  return (
    <>
      <div className="readme">
        <h3>{project.title}</h3>
        {project.about && <p>{project.about}</p>}
      </div>
      <p className="actions-right">
        <button
          type="button"
          className="pbtn default"
          onClick={() => open(`browser:${project.id}`)}
        >
          {projectUi.openSite}
        </button>
      </p>
    </>
  );
}
