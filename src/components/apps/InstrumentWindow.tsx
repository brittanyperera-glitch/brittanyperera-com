import { type InstrumentId, music } from "@/content/music";

export function InstrumentWindow({ id }: { id: InstrumentId }) {
  const instrument = music.instruments.find((i) => i.id === id);
  return <h3>{instrument?.name}</h3>;
}
