"use client";

import { useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { DONE_KEY } from "@/lib/setup";
import { writeJSON } from "@/lib/storage";
import type { Visitor, WinId } from "@/lib/types";
import "@/styles/phone-home.css";
import { PhoneIcon } from "./PhoneIcon";
import { useClock } from "./useClock";

const WHO_QUESTION_ID = "phone-who-question";

/** Replaces the menu bar on a phone; shown by the media query in phone-home.css. */
export function PhoneStatus() {
  const { time } = useClock();
  return (
    <div className="phone-status">
      <span>{copy.phone.statusName}</span>
      <span className="status-clock">{time}</span>
    </div>
  );
}

function PhoneApp({ id, label, onOpen }: { id: WinId; label: string; onOpen: () => void }) {
  return (
    <button type="button" className="phone-app" data-open={id} onClick={onOpen}>
      <PhoneIcon id={id} />
      <span className="phone-label">{label}</span>
    </button>
  );
}

/**
 * The phone's home screen. It is in the server HTML and shown by the (max-width: 700px) media
 * query, so a phone never waits on JavaScript to see it.
 */
export function PhoneHome() {
  const { open, state, visitor, setVisitor } = useDesktop();
  const dockIds = copy.phone.docks[visitor ?? "none"];
  const apps = copy.desktopIcons.filter((ic) => copy.phone.apps.includes(ic.open));
  const dock = dockIds.flatMap((id) => apps.filter((ic) => ic.open === id));
  const grid = apps.filter((ic) => !dockIds.includes(ic.open));
  const hint = copy.setup.visitors.find((v) => v.id === visitor)?.hint;

  const pick = (v: Visitor) => {
    setVisitor(v);
    writeJSON(DONE_KEY, { visitor: v });
  };

  const phone = state.mode === "phone";

  return (
    // Not live until the client knows this is a phone (a laptop's copy is display:none anyway), and
    // not reachable by Tab behind a full-screen app.
    <div
      className="phone-home"
      inert={!phone || state.open.length > 0}
      aria-hidden={phone ? undefined : true}
    >
      <div className="phone-grid">
        {grid.map((ic) => (
          <PhoneApp key={ic.open} id={ic.open} label={ic.label} onOpen={() => open(ic.open)} />
        ))}
      </div>
      <section className="phone-who" aria-labelledby={WHO_QUESTION_ID}>
        <p className="who-q" id={WHO_QUESTION_ID}>
          {copy.phone.who.question}
        </p>
        <div className="pills">
          {copy.setup.visitors.map((v) => (
            <button
              key={v.id}
              type="button"
              className="pill"
              aria-pressed={v.id === visitor}
              onClick={() => pick(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="who-hint" aria-live="polite">
          {hint ? copy.phone.who.picked.replace("{hint}", hint) : copy.phone.who.skip}
        </p>
      </section>
      <p className="phone-foot">{copy.phone.footer}</p>
      <nav className="phone-dock" aria-label={copy.phone.dockLabel}>
        {dock.map((ic) => (
          <PhoneApp key={ic.open} id={ic.open} label={ic.label} onOpen={() => open(ic.open)} />
        ))}
      </nav>
    </div>
  );
}
