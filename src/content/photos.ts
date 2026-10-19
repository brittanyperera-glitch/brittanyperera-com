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
      id: "indonesia",
      title: "Indonesia",
      items: [
        {
          src: "/photos/indonesia/crater.jpg",
          alt: "Brittany in a gas mask, crouched above a turquoise crater lake at sunrise",
          caption: "",
        },
        {
          src: "/photos/indonesia/volcano-sunrise.jpg",
          alt: "Sunrise over a ring of volcanoes under a purple and orange sky",
          caption: "",
        },
        {
          src: "/photos/indonesia/night-mask.jpg",
          alt: "A night selfie in a respirator and head torch, beside a glass of coffee in a wooden hut",
          caption: "",
        },
        {
          src: "/photos/indonesia/food-carts.jpg",
          alt: "A street lined with colourful food carts under palm trees",
          caption: "",
        },
      ],
    },
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
    {
      id: "laos",
      title: "Laos",
      items: [
        {
          src: "/photos/laos/temple-ceiling.jpg",
          alt: "A carved temple ceiling in gold and pale blue",
          caption: "",
        },
        {
          src: "/photos/laos/stupa.jpg",
          alt: "A moss-covered stupa against a deep blue sky",
          caption: "",
        },
        {
          src: "/photos/laos/fruit-stall.jpg",
          alt: "A night fruit stall piled with mangoes, apples and oranges",
          caption: "",
        },
      ],
    },
    {
      id: "kenya",
      title: "Kenya",
      items: [
        {
          src: "/photos/kenya/quad-bike.jpg",
          alt: "A rider in a yellow helmet on a blue quad bike at sunset",
          caption: "",
        },
        {
          src: "/photos/kenya/giraffe.jpg",
          alt: "A giraffe leaning in to take food from an outstretched hand",
          caption: "",
        },
        {
          src: "/photos/kenya/giraffe-friends.jpg",
          alt: "Four friends feeding a giraffe from a wooden deck",
          caption: "",
        },
        {
          src: "/photos/kenya/elephants.jpg",
          alt: "An elephant and its calf in long green grass",
          caption: "",
        },
      ],
    },
  ] as PhotoAlbum[],
  // The Photos window opens straight on this album instead of the album list.
  openAlbum: "indonesia",
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
