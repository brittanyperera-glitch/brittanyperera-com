import type { IconName, ProjectId } from "@/lib/types";

export type Project = {
  id: ProjectId;
  title: string;
  icon: IconName;
  blurb: string;
  tags: string[];
  embed?: { url: string; note: string };
  link?: { href: string; label: string };
};

export const projects: Project[] = [
  {
    id: "trip",
    title: "Trip Planner",
    icon: "palm",
    blurb:
      "Five friends, one Sri Lanka trip, too many opinions. Everyone rates activities Must, Keen, Meh or Skip; it builds a plan for each person, then a group plan, and settles arguments with head-to-head votes.",
    tags: ["Playable", "React", "Supabase"],
    embed: {
      url: "https://grouptriphero.brittanyperera.com/#/guest",
      note: "youre a guest, nothing you do counts. go wild",
    },
    link: { href: "https://grouptriphero.brittanyperera.com", label: "open it in a new tab" },
  },
  {
    id: "delulu",
    title: "100 Days of Delulu",
    icon: "heart",
    blurb:
      "A shared site for a couple's 100-day challenge. Now becoming a free template anyone can use.",
    tags: ["Next.js"],
    link: {
      href: "https://100-days-of-delulu.vercel.app",
      label: "the real one (password protected, sorry)",
    },
  },
  {
    id: "whereflix",
    title: "Whereflix",
    icon: "film",
    blurb: "Type a film or show, see every service it is streaming on.",
    tags: ["Next.js"],
  },
  {
    id: "gift",
    title: "Gift Finder",
    icon: "gift",
    blurb:
      "Interviews you about someone, tells you which direction to go (or not), then finds real gifts with prices and links.",
    tags: ["AI"],
  },
  {
    id: "schengen",
    title: "SchengenKit",
    icon: "passport",
    blurb: "An iPhone app that counts your days in the Schengen area so you never overstay.",
    tags: ["iOS", "Swift"],
  },
];
