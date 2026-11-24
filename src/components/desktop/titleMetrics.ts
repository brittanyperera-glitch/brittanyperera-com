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

export type Natural = { w: number; h: number; chrome: number };

// The window's size with its body cap lifted. A huge px value rather than `none`, so calc() users of
// --body-max still resolve. `chrome` is the height that is not body.
export function measureNatural(section: HTMLElement): Natural {
  const prev = section.style.getPropertyValue("--body-max");
  section.style.setProperty("--body-max", "99999px");
  const r = section.getBoundingClientRect();
  const body = section.querySelector<HTMLElement>(".body");
  const chrome = r.height - (body?.getBoundingClientRect().height ?? 0);
  if (prev) section.style.setProperty("--body-max", prev);
  else section.style.removeProperty("--body-max");
  return { w: r.width, h: r.height, chrome };
}
