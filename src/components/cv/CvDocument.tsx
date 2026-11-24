import { cv } from "@/content/cv";

type Entry = {
  title: string;
  org: string;
  place?: string;
  when: string;
  summary?: string;
  bullets?: string[];
};

function Entries({ items }: { items: readonly Entry[] }) {
  return items.map((e) => (
    <div className="cv-item" key={`${e.title}-${e.org}-${e.when}`}>
      <div className="cv-head">
        <span>{e.title}</span>
        <span className="cv-when">{e.when}</span>
      </div>
      <p>{[e.org, e.place].filter(Boolean).join(", ")}</p>
      {e.summary ? <p>{e.summary}</p> : null}
      {e.bullets && e.bullets.length > 0 ? (
        <ul>
          {e.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  ));
}

// One source for the /cv page and the CV window, so the two can never drift apart.
export function CvDocument({
  headingLevel = 1,
  standalone = false,
}: {
  headingLevel?: 1 | 3;
  standalone?: boolean;
}) {
  const Name = headingLevel === 1 ? "h1" : "h3";
  const Section = headingLevel === 1 ? "h2" : "h4";
  return (
    <>
      <Name>{cv.name}</Name>
      <p className="cv-headline">{cv.headline}</p>
      <p className="cv-links">
        <a href={`mailto:${cv.email}`}>{cv.email}</a>
        <a href={cv.linkedin}>{cv.linkedinLabel}</a>
        <a href={cv.github}>{cv.githubLabel}</a>
        {standalone ? (
          <a href="/Brittany-Perera-CV.pdf" download>
            {cv.downloadLabel}
          </a>
        ) : null}
        {standalone ? <a href="/">{cv.backLabel}</a> : null}
      </p>
      <p>{cv.profile}</p>

      <Section>{cv.sections.experience}</Section>
      <Entries items={cv.roles} />

      <Section>{cv.sections.projects}</Section>
      <Entries items={cv.projects} />

      <Section>{cv.sections.education}</Section>
      <Entries items={cv.education} />

      <Section>{cv.sections.leadership}</Section>
      <Entries items={cv.leadership} />

      <Section>{cv.sections.skills}</Section>
      {cv.skills.map(([label, text]) => (
        <p key={label}>
          <strong>{label}:</strong> {text}
        </p>
      ))}

      <Section>{cv.sections.languages}</Section>
      <p>{cv.languages}</p>
    </>
  );
}
