import { PixelIcon } from "@/components/PixelIcon";
import { type InstrumentId, music } from "@/content/music";
import "@/styles/music.css";

export function InstrumentWindow({
  id,
  instruments = music.instruments,
}: {
  id: InstrumentId;
  instruments?: typeof music.instruments;
}) {
  const instrument = instruments.find((i) => i.id === id);
  if (!instrument) return null;
  return (
    <div className="instrument">
      <PixelIcon name={instrument.icon} size={64} />
      <h3>{instrument.name}</h3>
      {instrument.line && <p>{instrument.line}</p>}
    </div>
  );
}
