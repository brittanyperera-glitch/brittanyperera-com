import { Desktop } from "@/components/desktop/Desktop";
import { SetupFlow } from "@/components/setup/SetupFlow";
import { AboutWindow } from "@/components/windows/AboutWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { CvWindow } from "@/components/windows/CvWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { projects } from "@/content/projects";
import type { WinId } from "@/lib/types";
import "@/styles/platinum.css";
import "@/styles/desktop.css";
import "@/styles/windows.css";

const windows: Partial<Record<WinId, React.ReactNode>> = {
  about: <AboutWindow />,
  cv: <CvWindow />,
  projects: <ProjectsWindow />,
  contact: <ContactWindow />,
  trash: <TrashWindow />,
  ...Object.fromEntries(
    projects.map((p) => [`project:${p.id}`, <ProjectWindow key={p.id} project={p} />]),
  ),
};

export default function Home() {
  return (
    <Desktop windows={windows}>
      <SetupFlow />
    </Desktop>
  );
}
