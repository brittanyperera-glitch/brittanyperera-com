import type { CSSProperties, ReactNode } from "react";
import type { WinId } from "@/lib/types";

// Original glossy tiles: a vertical gradient (--a to --b), a line drawing on top, and a gloss
// highlight added in phone-home.css.
const ART: Partial<Record<WinId, { a: string; b: string; art: ReactNode }>> = {
  cv: {
    a: "#7fb0f0",
    b: "#2c5ea8",
    art: (
      <>
        <rect x="17" y="10" width="30" height="42" rx="2" fill="#fff" />
        <path d="M39 10h8v8z" fill="#c9d6e8" />
        <rect x="22" y="17" width="14" height="3" rx="1" fill="#2d5aa0" />
        <g fill="#9aa8bb">
          <rect x="22" y="24" width="20" height="2" />
          <rect x="22" y="29" width="20" height="2" />
          <rect x="22" y="34" width="16" height="2" />
          <rect x="22" y="39" width="20" height="2" />
          <rect x="22" y="44" width="12" height="2" />
        </g>
      </>
    ),
  },
  projects: {
    a: "#ffb25c",
    b: "#c9662a",
    art: (
      <>
        <path
          d="M10 20a3 3 0 0 1 3-3h13l4 4h21a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z"
          fill="#fff3d6"
        />
        <path d="M10 26h44v20a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#ffe2a3" />
      </>
    ),
  },
  photos: {
    a: "#8fd4ff",
    b: "#2f8aa3",
    art: (
      <>
        <circle cx="44" cy="20" r="7" fill="#fff4b8" />
        <path d="M6 52 24 28l10 12 7-8 17 20z" fill="#2f5d3a" />
        <path d="M6 52 24 28l6 8-8 16z" fill="#3f7a4c" />
        <path d="M20 33l4-5 4 5-4 2z" fill="#fff" />
      </>
    ),
  },
  music: {
    a: "#d0565f",
    b: "#6c1b28",
    art: (
      <>
        <rect x="9" y="18" width="46" height="30" rx="3" fill="#fbfbf7" />
        <g fill="#c7c2b5">
          <rect x="18" y="18" width="1" height="30" />
          <rect x="27" y="18" width="1" height="30" />
          <rect x="36" y="18" width="1" height="30" />
          <rect x="45" y="18" width="1" height="30" />
        </g>
        <g fill="#1b1b1f">
          <rect x="15" y="18" width="6" height="18" rx="1" />
          <rect x="24" y="18" width="6" height="18" rx="1" />
          <rect x="42" y="18" width="6" height="18" rx="1" />
        </g>
      </>
    ),
  },
  youtube: {
    a: "#ff6a5c",
    b: "#b3201c",
    art: (
      <>
        <path
          d="M24 10l8 8 8-8"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="9" y="18" width="46" height="34" rx="7" fill="#fff" />
        <rect x="14" y="23" width="36" height="24" rx="5" fill="#3a0d0d" />
        <path d="M28 29v12l10-6z" fill="#fff" />
      </>
    ),
  },
  contact: {
    a: "#8edc6a",
    b: "#3f8a2a",
    art: (
      <>
        <path
          d="M12 16h40a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H28l-10 8v-8h-6a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z"
          fill="#fff"
        />
        <g fill="#2f7a2f">
          <circle cx="23" cy="30" r="3.2" />
          <circle cx="32" cy="30" r="3.2" />
          <circle cx="41" cy="30" r="3.2" />
        </g>
      </>
    ),
  },
  trash: {
    a: "#b8c1cc",
    b: "#5e6670",
    art: (
      <>
        <rect x="17" y="16" width="30" height="5" rx="2" fill="#f4f6f8" />
        <rect
          x="27"
          y="11"
          width="10"
          height="5"
          rx="1.5"
          fill="none"
          stroke="#f4f6f8"
          strokeWidth="2"
        />
        <path d="M20 23h24l-3 29H23z" fill="#f4f6f8" />
        <g stroke="#8b95a1" strokeWidth="2">
          <path d="M27 28v19M32 28v19M37 28v19" />
        </g>
      </>
    ),
  },
};

export function PhoneIcon({ id }: { id: WinId }) {
  const icon = ART[id];
  if (!icon) return null;
  return (
    <span className="phone-ic" style={{ "--a": icon.a, "--b": icon.b } as CSSProperties}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        {icon.art}
      </svg>
    </span>
  );
}
