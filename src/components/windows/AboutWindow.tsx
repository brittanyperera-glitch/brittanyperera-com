"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { PixelIcon } from "@/components/PixelIcon";
import { about } from "@/content/about";
import { copy } from "@/content/copy";

export function AboutWindow() {
  const { open } = useDesktop();
  return (
    <>
      <div className="row">
        <PixelIcon name="person" size={60} label={copy.setup.portraitAlt} />
        <div>
          <h3>{about.heading}</h3>
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <p>
        <b>{about.timelineHeading}</b>
      </p>
      <ul className="timeline">
        {about.timeline.map((t) => (
          <li key={t.when}>
            <b>{t.when}</b>
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
      <p className="actions">
        <button type="button" className="pbtn" onClick={() => open("cv")}>
          {copy.menus.file[0].label}
        </button>{" "}
        <button type="button" className="pbtn" onClick={() => open("projects")}>
          {copy.windowTitles.projects}
        </button>{" "}
        <button type="button" className="pbtn" onClick={() => open("contact")}>
          {copy.windowTitles.contact}
        </button>
      </p>
      <div className="open-hint">{copy.windows.openHint}</div>
    </>
  );
}
