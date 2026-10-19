import { appWindows } from "@/components/apps/appWindows";
import { Desktop } from "@/components/desktop/Desktop";
import { SetupFlow } from "@/components/setup/SetupFlow";
import { BrowserWindow } from "@/components/windows/BrowserWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { CvWindow } from "@/components/windows/CvWindow";
import { NoteWindow } from "@/components/windows/NoteWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { meta } from "@/content/meta";
import { projects } from "@/content/projects";
import type { WinId } from "@/lib/types";
import "@/styles/platinum.css";
import "@/styles/desktop.css";
import "@/styles/windows.css";

const windows: Partial<Record<WinId, React.ReactNode>> = {
  cv: <CvWindow />,
  projects: <ProjectsWindow />,
  contact: <ContactWindow />,
  trash: <TrashWindow />,
  note: <NoteWindow />,
  ...appWindows,
  ...Object.fromEntries(
    projects.flatMap((p) => [
      [`project:${p.id}`, <ProjectWindow key={p.id} project={p} />],
      [`browser:${p.id}`, <BrowserWindow key={`browser-${p.id}`} project={p} />],
    ]),
  ),
};

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">{meta.title}</h1>
      <Desktop windows={windows}>
        <SetupFlow />
      </Desktop>
    </main>
  );
}
