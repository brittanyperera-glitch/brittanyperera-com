"use client";

import { useEffect, useState } from "react";
import { useDesktop } from "@/components/desktop/Desktop";
import { PixelIcon } from "@/components/PixelIcon";
import { type Project, projectUi } from "@/content/projects";
import "@/styles/browser.css";

// A late-90s browser around a project's live site. The window stays mounted while closed, so the
// frame is only rendered while it is open: closing unloads the site.
export function BrowserWindow({ project }: { project: Project }) {
  const { state, actions } = useDesktop();
  const isOpen = state.open.includes(`browser:${project.id}`);
  // Cross-origin frames cannot be told to reload, so Reload remounts the frame instead.
  const [loads, setLoads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setLoading(true);
  }, [isOpen]);

  return (
    <div className="browser">
      <div className="browser-bar">
        <button
          type="button"
          className="pbtn"
          onClick={() => {
            setLoading(true);
            setLoads((n) => n + 1);
          }}
        >
          {projectUi.reload}
        </button>
        <input
          type="text"
          className="browser-address"
          readOnly
          aria-label={projectUi.address}
          value={project.siteUrl}
        />
        <button type="button" className="pbtn" onClick={() => actions.leave(project.siteUrl)}>
          {projectUi.newTab}
        </button>
        <span className={loading && isOpen ? "browser-throbber busy" : "browser-throbber"}>
          <PixelIcon name="globe" size={24} />
        </span>
      </div>
      <div className="browser-page">
        {isOpen && (
          <iframe
            key={loads}
            title={project.title}
            src={project.siteUrl}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
