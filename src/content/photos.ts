export type PhotoItem = { src: string; alt: string; caption: string };

export type PhotoAlbum = {
  id: string;
  title: string;
  /** Ids from youtube.videos; each gets a watch button in the album viewer. */
  videoIds?: string[];
  items: PhotoItem[];
};

export const photos = {
  title: "Photos",
  // General first, then country by country. An album with no items is not shown.
  albums: [{ id: "general", title: "General", items: [] }] as PhotoAlbum[],
  ui: {
    back: "All albums",
    prev: "Previous",
    next: "Next",
    counter: "Item {n} of {total}",
    scroll: "Scroll through the album",
    watchVideo: "watch the video",
    watchNamed: "watch {title}",
  },
};
