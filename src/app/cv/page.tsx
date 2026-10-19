import type { Metadata } from "next";
import { cv } from "@/content/cv";
import "@/styles/cv-print.css";

export const metadata: Metadata = { title: "CV | Brittany Perera" };

type Entry = {
  title: string;
  org: string;
  when: string;
  summary?: string;
  bullets?: string[];
};

function Entries({ items }: { items: readonly Entry[] }) {
  return items.map((e) => (
    <div className="cv-item" key={`${e.title}-${e.org}`}>
      <div className="cv-head">
        <span>{e.title}</span>
        <span className="cv-when">{e.when}</span>
      </div>
      <p>{e.org}</p>
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

export default function CvPage() {
  return (
    <main className="cv">
      <h1>{cv.name}</h1>
      <p>
        <a href={`mailto:${cv.email}`}>{cv.email}</a>
      </p>

      <h2>Experience</h2>
      <Entries items={cv.roles} />

      <h2>Education</h2>
      <Entries items={cv.education} />

      <h2>Leadership</h2>
      <Entries items={cv.leadership} />

      <h2>Skills</h2>
      <p>{cv.skills.join(", ")}</p>

      <h2>Languages</h2>
      <p>{cv.languages.join(", ")}</p>
    </main>
  );
}
