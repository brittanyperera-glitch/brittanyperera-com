import data from "./cv-data.json";

const link = (needle: string) => data.contact.find((c) => c.text.includes(needle))?.href ?? "";

export const cv = {
  metaTitle: "CV | Brittany Perera",
  sections: {
    experience: "Experience",
    projects: "Engineering projects",
    education: "Education",
    leadership: "Leadership",
    skills: "Skills",
    languages: "Languages",
  },
  name: data.name,
  headline: data.title,
  profile: data.profile,
  email: "brittanykawshalya@gmail.com",
  linkedin: link("linkedin"),
  github: link("github"),
  tags: ["Python", "TypeScript", "ML", "Geospatial", "SQL"],
  roles: data.experience.map((e) => ({
    title: e.role,
    org: e.org,
    place: e.place,
    when: e.dates,
    summary: "",
    bullets: e.bullets,
  })),
  projects: data.projects.flatMap((g) =>
    g.items.map((i) => ({ title: i.name, org: g.label, place: "", when: "", summary: i.text })),
  ),
  education: data.education.map((e) => ({
    title: e.role,
    org: e.org,
    place: "",
    when: e.dates,
    summary: e.lines.join(" "),
  })),
  leadership: data.leadership.map((l) => ({
    title: l.role,
    org: "",
    place: "",
    when: l.dates,
    summary: l.text,
  })),
  skills: data.skills.filter(([label]) => label !== "Languages") as [string, string][],
  languages: data.languages,
  linkedinLabel: "LinkedIn",
  githubLabel: "GitHub",
  downloadLabel: "Download PDF",
  backLabel: "Back to the desktop",
};
