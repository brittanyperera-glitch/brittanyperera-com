"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { trash, trashHeader } from "@/content/trash";

export function TrashWindow() {
  const { actions } = useDesktop();
  return (
    <>
      <p className="info">{trashHeader}</p>
      <ul className="trash-list">
        {trash.map((t) => (
          <li key={t.name}>{t.caption}</li>
        ))}
      </ul>
      <div className="actions-right">
        <button type="button" className="pbtn" onClick={actions.emptytrash}>
          {copy.alerts.emptyTrash.empty}
        </button>
      </div>
    </>
  );
}
