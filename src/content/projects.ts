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
};

export const projects: Project[] = [
  {
    id: "delulu",
    title: "100 Days of Delulu",
    icon: "heart",
    about: "",
    siteUrl: "https://100-days-of-delulu.vercel.app",
    siteLabel: "100 Days of Delulu, live site",
  },
  {
    id: "trip",
    title: "Group Trip Hero",
    icon: "palm",
    about: "",
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
