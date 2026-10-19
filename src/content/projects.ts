import type { IconName, ProjectId } from "@/lib/types";

export type Project = {
  id: ProjectId;
  title: string;
  icon: IconName;
  /** Brittany's own text for the About window. Empty until she writes it. */
  about: string;
  /** The live site the browser window loads. */
  siteUrl: string;
  /** Title of the browser window. */
  siteLabel: string;
  /** A promo video shown in the About window, hosted in public/video. */
  video?: { src: string; poster: string; label: string };
};

export const projects: Project[] = [
  {
    id: "delulu",
    title: "100 Days of Delulu",
    icon: "heart",
    // Draft for Brittany to keep or change (2026-10-19), from the Delulu README.
    about:
      "a private little site for two. for 100 days you act like the life you want is already yours. a countdown, one shared wall and a ring of tiny games around it. the real one's password protected, sorry",
    siteUrl: "https://100-days-of-delulu.vercel.app",
    siteLabel: "100 Days of Delulu, live site",
    // Web encode of the promo animatic (archived as a release on the Delulu repo, which is private).
    video: {
      src: "/video/delulu-promo.mp4",
      poster: "/video/delulu-promo-poster.jpg",
      label: "100 Days of Delulu promo video",
    },
  },
  {
    id: "trip",
    title: "Group Trip Hero",
    icon: "palm",
    // Brittany's words, 2026-10-19.
    about:
      "i didnt want the group chat drama. i made an app to optimize the trip for us- we vote, the ai makes sure we're all happy",
    siteUrl: "https://grouptriphero.brittanyperera.com/#/guest",
    siteLabel: "Group Trip Hero, live site",
  },
];

export const projectUi = {
  aboutTitle: "About {title}",
  openSite: "open the site",
  reload: "Reload",
  address: "Address",
  newTab: "open in a new tab",
};
