"use client";

import { useAlert } from "@/components/alert/AlertProvider";
import { useDesktop } from "@/components/desktop/Desktop";
import { PixelIcon } from "@/components/PixelIcon";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";

export function ContactWindow() {
  const { actions, close } = useDesktop();
  const alert = useAlert();

  const copyEmail = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(contact.email);
      alert({ icon: "note", body: copy.alerts.copyEmail });
    } catch {
      alert({ icon: "caution", body: copy.alerts.copyEmailFailed });
    }
  };

  return (
    <>
      <div className="row">
        <PixelIcon name="mail" size={40} />
        <p>{copy.contactInvite}</p>
      </div>
      <p className="email-field">{contact.email}</p>
      <p>
        {contact.linkedin && (
          <button
            type="button"
            className="linklike"
            onClick={() => actions.leave(contact.linkedin ?? "")}
          >
            {copy.windows.linkedin}
          </button>
        )}
        <button type="button" className="linklike" onClick={() => actions.leave(contact.github)}>
          {copy.windows.github}
        </button>
      </p>
      <div className="actions-right">
        <button type="button" className="pbtn" onClick={copyEmail}>
          {copy.windows.copyEmail}
        </button>{" "}
        <button type="button" className="pbtn default" onClick={() => close("contact")}>
          {copy.chrome.ok}
        </button>
      </div>
    </>
  );
}
