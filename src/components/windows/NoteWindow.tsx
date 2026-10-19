import { copy } from "@/content/copy";

// A Mac OS 9 Stickies note saying where to start.
export function NoteWindow() {
  return (
    <div className="sticky-note">
      {copy.note.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
