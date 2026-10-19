"use client";

import { CvDocument } from "@/components/cv/CvDocument";
import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";

export function CvWindow() {
  const { actions } = useDesktop();
  return (
    <>
      <div className="doc-toolbar">
        <span className="doc-name">{copy.windowTitles.cv}</span>
        <span className="sep" aria-hidden="true" />
        <a href="/cv">{copy.windows.cvPageLink}</a>
        <button type="button" className="pbtn default" onClick={actions.download}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M6 1.5V8M3 5.5L6 8.5L9 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M1.5 10.5H10.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {cv.downloadLabel}
        </button>
      </div>
      <div className="paper-desk">
        <article className="cv-doc paper">
          <CvDocument headingLevel={3} />
        </article>
      </div>
      <p className="open-hint">{copy.windows.openHint}</p>
    </>
  );
}
