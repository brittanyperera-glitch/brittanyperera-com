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
      {project.video && (
        // biome-ignore lint/a11y/useMediaCaption: no speech to caption; per the promo's STORYBOARD-v3.md every word is on-screen text and the audio is sound effects
        <video
          className="promo"
          src={project.video.src}
          poster={project.video.poster}
          aria-label={project.video.label}
          preload="none"
          controls
          playsInline
        />
      )}
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
