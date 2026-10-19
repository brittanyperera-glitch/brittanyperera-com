import type { TitleMetrics } from "@/lib/windows";

// Title bar extent relative to the window's left border edge. The clamp has to use the title bar,
// not the section: the section's border sits outside it.
export function measureTitle(section: HTMLElement): TitleMetrics {
  const bar = section.querySelector<HTMLElement>(".titlebar");
  if (!bar) return { titleLeft: 0, titleRight: section.offsetWidth };
  const s = section.getBoundingClientRect();
  const b = bar.getBoundingClientRect();
  return { titleLeft: b.left - s.left, titleRight: b.right - s.left };
}
