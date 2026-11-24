export type PhotoItem = { src: string; alt: string; caption: string };

export const photos = {
  title: "Photos",
  // One library. A caption is optional: "" shows none.
  items: [
    {
      src: "/photos/life/oxford-grad.jpg",
      alt: "Brittany in a graduation gown and mortarboard holding flowers outside an Oxford college",
      caption: "grad oxford",
    },
    {
      src: "/photos/life/hockey-goalie.jpg",
      alt: "A hockey team in maroon and gold in front of a goal, the goalie kneeling in yellow pads",
      caption: "HOCKEY GOALIE (the brick wall)",
    },
    {
      src: "/photos/life/engine-talk.jpg",
      alt: "Brittany speaking into a microphone on stage beside a colleague",
      caption: "teaching people about ML engine servicing",
    },
    {
      src: "/photos/life/football-goalie.jpg",
      alt: "A football team in blue kit on a pitch with mountains behind",
      caption: "vietnam football goalie for Engineering team (brick wall)",
    },
    {
      src: "/photos/life/camp-usa.jpg",
      alt: "Brittany mid-stride racing across a grassy camp field",
      caption: "athletics counsellor at CampUSA",
    },
    {
      src: "/photos/life/tet-armchairs.jpg",
      alt: "Brittany and a friend in silk ao dai lounging on white armchairs",
      caption: "vietnam tet",
    },
    {
      src: "/photos/life/tet-steps.jpg",
      alt: "Friends in ao dai posing on steps beside yellow flowers",
      caption: "vietnam tet",
    },
    {
      src: "/photos/life/muay-thai.jpg",
      alt: "Brittany kicking a trainer's pad in an open-air Muay Thai gym",
      caption: "very much not a muay thai expert",
    },
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
  ] as PhotoItem[],
  ui: {
    backToGrid: "Photos",
    countOne: "1 photo",
    countMany: "{n} photos",
    prev: "Previous",
    next: "Next",
    counter: "Item {n} of {total}",
    scroll: "Scroll through the photos",
  },
};
