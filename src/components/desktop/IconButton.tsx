"use client";

import { useState } from "react";
import { MacIcon } from "@/components/icons/MacIcon";
import type { IconName } from "@/lib/types";
import { useDesktop } from "./Desktop";

type Props = {
  icon: IconName;
  label: string;
  onOpen: () => void;
  /** Controlled selection, so a group of icons can share one selected item. */
  selected?: boolean;
  onSelect?: () => void;
  /** Rendered as data-open so focus can return to the icon that opened a window. */
  openId?: string;
};

// Click selects; double-click or Enter opens; on phone one tap opens (double-tap is awkward).
export function IconButton({ icon, label, onOpen, selected, onSelect, openId }: Props) {
  const { state } = useDesktop();
  const [localSelected, setLocalSelected] = useState(false);
  const isSelected = selected ?? localSelected;
  const phone = state.mode === "phone";

  return (
    <button
      type="button"
      className={isSelected ? "icon selected" : "icon"}
      data-open={openId}
      onClick={() => {
        setLocalSelected(true);
        onSelect?.();
        if (phone) onOpen();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <MacIcon name={icon} size={32} />
      <span className="label">{label}</span>
    </button>
  );
}
