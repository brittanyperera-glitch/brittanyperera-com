"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";

export function CvWindow() {
  const { actions } = useDesktop();
  const edu = cv.education[0];
  return (
    <>
      <h3>{cv.name}</h3>
      <p>
        {cv.tags.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </p>
      {cv.roles.map((r) => (
        <p key={`${r.title}-${r.when}`}>
          <b>{r.title}</b>
          <span className="org">{r.org}</span>
          <span className="when">{r.when}</span>
        </p>
      ))}
      <p>
        <b>{edu.title}</b>
        <span className="org">{edu.org}</span>
        <span className="when">{edu.when}</span>
      </p>
      <p>
        <button type="button" className="pbtn default" onClick={actions.download}>
          {cv.downloadLabel}
        </button>
      </p>
      <p className="info">
        <a href="/cv">{copy.windows.cvPageLink}</a>
      </p>
      <p className="open-hint">{copy.windows.openHint}</p>
    </>
  );
}
