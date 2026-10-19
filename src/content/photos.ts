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
  albums: [
    { id: "general", title: "General", items: [] },
    {
      id: "singapore",
      title: "Singapore",
      items: [
        {
          src: "/photos/singapore/supertrees.jpg",
          alt: "The Supertrees at Gardens by the Bay lit up purple at night",
          caption: "",
        },
        {
          src: "/photos/singapore/vietjet-selfie.jpg",
          alt: "Brittany in sunglasses and a VietJet lanyard, pulling a face",
          caption: "",
        },
        {
          src: "/photos/singapore/expo-hall.jpg",
          alt: "An exhibition hall with officers in uniform walking past stands",
          caption: "",
        },
        {
          src: "/photos/singapore/airbus-reception.jpg",
          alt: "An Airbus evening reception under white arches and chandeliers",
          caption: "",
        },
      ],
    },
    {
      id: "turkey",
      title: "Turkey",
      items: [
        {
          src: "/photos/turkey/balloons.jpg",
          alt: "Hot air balloons over Cappadocia",
          caption: "",
        },
        {
          src: "/photos/turkey/horse-cappadocia.jpg",
          alt: "Horse riding in Cappadocia",
          caption: "",
        },
        {
          src: "/photos/turkey/istanbul-skyline.jpg",
          alt: "The Istanbul skyline",
          caption: "",
        },
        { src: "/photos/turkey/kebab-selfie.jpg", alt: "A selfie with a kebab", caption: "" },
        {
          src: "/photos/turkey/sunset-ride.jpg",
          alt: "A ride at sunset",
          caption: "",
        },
      ],
    },
  ] as PhotoAlbum[],
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
