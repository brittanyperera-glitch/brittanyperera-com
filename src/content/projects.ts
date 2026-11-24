import type { IconName, ProjectId } from "@/lib/types";

export type Project = {
  id: ProjectId;
  title: string;
  icon: IconName;
  /** Brittany's own text for the About window. Empty until she writes it. */
  about: string;
  /** The live site the browser window loads. */
  siteUrl?: string;
  /** Title of the browser window. */
  siteLabel?: string;
  /** When set, the About window's button opens this in a new tab instead of the browser window. */
  codeUrl?: string;
  /** A promo video shown in the About window, hosted in public/video. */
  video?: { src: string; poster: string; label: string };
  /** Case-study sections, shown in this order when present. Absent ones render nothing. */
  problem?: string;
  built?: string;
  hardest?: string;
  result?: string;
  stack?: string[];
  /** Outbound links listed in the case study; separate from the button above. */
  links?: { live?: string; repo?: string; video?: string };
  image?: { src: string; alt: string };
};

export const projects: Project[] = [
  {
    id: "delulu",
    title: "100 Days of Delulu",
    icon: "heart",
    // Draft for Brittany to keep or change (2026-10-19), from the Delulu README.
    about:
      "a private little site for two. for 100 days you act like the life you want is already yours. a countdown, one shared wall and a ring of tiny games around it. the real one's password protected, sorry",
    // GitHub refuses iframes, so this goes to a new tab, not the browser window.
    codeUrl: "https://github.com/brittanyperera-glitch/delulu-template",
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

/** Projects with a live site: each gets a browser window. */
export type SiteProject = Project & { siteUrl: string; siteLabel: string };
export const siteProjects = projects.filter(
  (p): p is SiteProject => p.siteUrl !== undefined && p.siteLabel !== undefined,
);

export const projectUi = {
  aboutTitle: "About {title}",
  openSite: "open the site",
  viewCode: "view the code",
  reload: "Reload",
  address: "Address",
  newTab: "open in a new tab",
  sections: {
    problem: "The problem",
    built: "What I built",
    hardest: "The hardest part",
    result: "The result",
    stack: "Stack",
    links: "Links",
  },
  linkLabels: { live: "live site", repo: "code", video: "video" },
};
