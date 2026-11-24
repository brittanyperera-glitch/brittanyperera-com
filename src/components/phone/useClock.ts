import { useEffect, useState } from "react";

const TICK_MS = 15000;

/** Time and date strings, empty until mounted: the server's clock is not the visitor's. */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return {
    time: now?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) ?? "",
    date: now?.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }) ?? "",
  };
}
