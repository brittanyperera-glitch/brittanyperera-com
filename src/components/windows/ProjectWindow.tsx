"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { type Project, projectUi } from "@/content/projects";
import type { WinId } from "@/lib/types";

const TEXT_SECTIONS = ["problem", "built", "hardest", "result"] as const;
const LINK_KEYS = ["live", "repo", "video"] as const;

// Optional case-study sections, in content order; each renders only when the project has it.
function CaseStudy({ project }: { project: Project }) {
  const { actions } = useDesktop();
  const { stack, links, image } = project;
  const linkList = LINK_KEYS.flatMap((k) => {
    const href = links?.[k];
    return href ? [{ k, href }] : [];
  });
  return (
    <>
      {TEXT_SECTIONS.map((k) =>
        project[k] ? (
          <section key={k} className="case-section">
            <h4>{projectUi.sections[k]}</h4>
            <p>{project[k]}</p>
          </section>
        ) : null,
      )}
      {stack && stack.length > 0 && (
        <section className="case-section">
          <h4>{projectUi.sections.stack}</h4>
          <ul className="case-stack">
            {stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}
      {linkList.length > 0 && (
        <section className="case-section">
          <h4>{projectUi.sections.links}</h4>
          <ul className="case-links">
            {linkList.map(({ k, href }) => (
              <li key={k}>
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    actions.leave(href);
                  }}
                >
                  {projectUi.linkLabels[k]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {image && (
        // biome-ignore lint/performance/noImgElement: a fixed-size window figure, not a page image
        <img
          className="case-image"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
        />
      )}
    </>
  );
}

// A SimpleText-style read-me; its one button opens the site in the browser window.
export function ProjectWindow({ project }: { project: Project }) {
  const { open, actions } = useDesktop();
  const { codeUrl } = project;
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
      <CaseStudy project={project} />
      <p className="actions-right">
        <button
          type="button"
          className="pbtn default"
          onClick={() =>
            codeUrl ? actions.leave(codeUrl) : open(`browser:${project.id}` as WinId)
          }
        >
          {codeUrl ? projectUi.viewCode : projectUi.openSite}
        </button>
      </p>
    </>
  );
}
