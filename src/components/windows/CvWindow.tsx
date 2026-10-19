"use client";

import { CvDocument } from "@/components/cv/CvDocument";
import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";

export function CvWindow() {
  const { actions } = useDesktop();
  return (
    <>
      <p>
        <button type="button" className="pbtn default" onClick={actions.download}>
          {cv.downloadLabel}
        </button>{" "}
        <a href="/cv">{copy.windows.cvPageLink}</a>
      </p>
      <div className="cv-doc">
        <CvDocument headingLevel={3} />
      </div>
      <p className="open-hint">{copy.windows.openHint}</p>
    </>
  );
}
