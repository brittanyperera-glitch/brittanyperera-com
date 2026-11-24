"use client";

import { useAlert } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { PixelIcon } from "@/components/PixelIcon";
import { contact, handleOf } from "@/content/contact";
import { copy } from "@/content/copy";

export function ContactWindow() {
  const { actions, close } = useDesktop();
  const alert = useAlert();

  const copyTo = (address: string, done: string, failed: string) => async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(address);
      alert({ icon: "note", body: done });
    } catch {
      alert({ icon: "caution", body: failed });
    }
  };
  const copyWork = copyTo(
    contact.workEmail,
    copy.alerts.copyWorkEmail,
    copy.alerts.copyWorkEmailFailed,
  );
  const copyPersonal = copyTo(contact.email, copy.alerts.copyEmail, copy.alerts.copyEmailFailed);

  return (
    <>
      <div className="row">
        <PixelIcon name="mail" size={40} />
        <p>{copy.contactInvite}</p>
      </div>
      <p className="email-field">
        {copy.windows.workLabel} <span>{contact.workEmail}</span>
      </p>
      <p className="email-field">
        {copy.windows.personalLabel} <span>{contact.email}</span>
      </p>
      <p>
        {contact.linkedin && (
          <button
            type="button"
            className="linklike"
            onClick={() => actions.leave(contact.linkedin ?? "")}
          >
            {copy.windows.linkedin} {handleOf(contact.linkedin)}
          </button>
        )}
        <button type="button" className="linklike" onClick={() => actions.leave(contact.github)}>
          {copy.windows.github} {handleOf(contact.github)}
        </button>
      </p>
      <div className="actions-right">
        <button type="button" className="pbtn" onClick={copyWork}>
          {copy.windows.copyWorkEmail}
        </button>{" "}
        <button type="button" className="pbtn" onClick={copyPersonal}>
          {copy.windows.copyEmail}
        </button>{" "}
        <button type="button" className="pbtn default" onClick={() => close("contact")}>
          {copy.chrome.ok}
        </button>
      </div>
    </>
  );
}
