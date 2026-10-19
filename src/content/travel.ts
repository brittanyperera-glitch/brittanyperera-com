/** One pin on the map. lat and lon are decimal degrees (north and east positive), e.g. 38.72, -9.14. */
export type Place = { name: string; lat: number; lon: number; opinion: string };

export const travel = {
  title: "Travel",
  places: [] as Place[],
  ui: {
    mapLabel: "World map with pins for places Brittany has been",
    closeNote: "Close note",
    hint: "click a pin for my take",
    empty: "no pins yet",
  },
};
