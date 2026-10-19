"use client";

import { useEffect, useRef, useState } from "react";
import { useAlertOpen } from "@/components/alert/AlertProvider";
import { PixelIcon } from "@/components/PixelIcon";
import { copy } from "@/content/copy";
import { useDesktop } from "./Desktop";

type MenuKey = keyof typeof copy.menus;

// Divider sits before the last item of these menus, as in the mockup.
const MENUS: { key: MenuKey; title: string; separated: boolean }[] = [
  { key: "apple", title: copy.chrome.menuTitles.apple, separated: true },
  { key: "brittany", title: copy.chrome.menuTitles.brittany, separated: false },
  { key: "file", title: copy.chrome.menuTitles.file, separated: true },
  { key: "view", title: copy.chrome.menuTitles.view, separated: false },
  { key: "special", title: copy.chrome.menuTitles.special, separated: true },
];

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MenuBar() {
  const { open, runAction, soundOn, toggleSound } = useDesktop();
  const alertOpen = useAlertOpen();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [clock, setClock] = useState("");
  const barRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({});

  // Read the time in an effect so server and first client render agree.
  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (openMenu === null) return;
    // Any press outside the open menu closes it, including the rest of the bar (sound, clock).
    const onPointerDown = (e: PointerEvent) => {
      const menu = barRef.current?.querySelector(".menu.open");
      if (!menu?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || alertOpen) return;
      const menu = barRef.current?.querySelector(".menu.open");
      if (menu?.contains(document.activeElement)) titleRefs.current[openMenu]?.focus();
      setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu, alertOpen]);

  return (
    <div className="menubar" ref={barRef}>
      {MENUS.map(({ key, title, separated }) => {
        const items = copy.menus[key];
        const isOpen = openMenu === key;
        return (
          <div key={key} className={isOpen ? "menu open" : "menu"}>
            <button
              type="button"
              ref={(el) => {
                titleRefs.current[key] = el;
              }}
              aria-expanded={isOpen}
              aria-controls={`menu-${key}`}
              aria-label={key === "apple" ? title : undefined}
              onClick={() => setOpenMenu(isOpen ? null : key)}
            >
              {key === "apple" ? (
                <PixelIcon name="apple" size={16} />
              ) : key === "brittany" ? (
                <b>{title}</b>
              ) : (
                title
              )}
            </button>
            {isOpen && (
              <ul id={`menu-${key}`}>
                {items.map((item, i) => (
                  <li
                    key={item.label}
                    className={separated && i === items.length - 1 ? "sep" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        // Return focus to the menu title first so an alert hands it back somewhere real.
                        titleRefs.current[key]?.focus();
                        if (item.open) open(item.open);
                        else if (item.action) runAction(item.action);
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <div className="right">
        <button type="button" className="sound" onClick={toggleSound}>
          {soundOn ? copy.chrome.soundOn : copy.chrome.soundOff}
        </button>
        <span className="clock">{clock}</span>
      </div>
    </div>
  );
}
