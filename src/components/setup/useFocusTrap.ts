import { type RefObject, useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside `root` while `enabled`. Every Tab is handled here rather than left to the
 * browser, so focus also comes back in from <body> (or anything else outside) instead of walking
 * out to the page behind the overlay.
 */
export function useFocusTrap(root: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const box = root.current;
      if (!box) return;
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (box.matches(FOCUSABLE)) items.unshift(box);
      if (items.length === 0) return;
      const at = items.indexOf(document.activeElement as HTMLElement);
      const step = e.shiftKey ? -1 : 1;
      const next =
        at === -1 ? (e.shiftKey ? items.length - 1 : 0) : (at + step + items.length) % items.length;
      e.preventDefault();
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [root, enabled]);
}
