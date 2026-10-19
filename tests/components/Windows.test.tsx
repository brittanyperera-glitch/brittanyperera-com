// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { CvWindow } from "@/components/windows/CvWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
import { projects } from "@/content/projects";
import { trash } from "@/content/trash";
import type { WinId } from "@/lib/types";

function Opener({ ids }: { ids: WinId[] }) {
  const { open } = useDesktop();
  useEffect(() => {
    for (const id of ids) open(id);
  }, [ids, open]);
  return null;
}

const windows: Partial<Record<WinId, ReactNode>> = {
  cv: <CvWindow />,
  projects: <ProjectsWindow />,
  trash: <TrashWindow />,
  ...Object.fromEntries(
    projects.map((p) => [`project:${p.id}`, <ProjectWindow key={p.id} project={p} />]),
  ),
};

function setup(ids: WinId[]) {
  render(
    <Desktop windows={windows}>
      <Opener ids={ids} />
    </Desktop>,
  );
  return userEvent.setup();
}

function win(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`section[data-win="${id}"]`);
  if (!el) throw new Error(`no window ${id}`);
  return el;
}

describe("CV", () => {
  it("links to the full CV page, which works without JavaScript", () => {
    setup(["cv"]);
    const link = within(win("cv")).getByRole("link", { name: copy.windows.cvPageLink });
    expect(link).toHaveAttribute("href", "/cv");
  });

  it("Download PDF shows the download alert", async () => {
    const user = setup(["cv"]);
    await user.click(within(win("cv")).getByRole("button", { name: "Download PDF" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(copy.alerts.download);
  });

  it("shows the MEng line from the mockup and capitalises Now", () => {
    setup(["cv"]);
    const w = within(win("cv"));
    const edu = cv.education[0];
    expect(w.getByText(edu.title)).toBeInTheDocument();
    expect(w.getByText(edu.org, { exact: false })).toBeInTheDocument();
    expect(w.getByText(edu.when, { exact: false })).toBeInTheDocument();
    expect(w.getByText("Now")).toBeInTheDocument();
    expect(w.queryByText("now")).toBeNull();
  });

  it("links to the full CV page with a plain anchor", () => {
    setup(["cv"]);
    expect(within(win("cv")).getByRole("link", { name: copy.windows.cvPageLink })).toHaveAttribute(
      "href",
      "/cv",
    );
  });
});

describe("Projects", () => {
  it("lists all projects and Enter opens one", async () => {
    const user = setup(["projects"]);
    const w = within(win("projects"));
    expect(projects).toHaveLength(5);
    expect(
      w.getByText(copy.windows.projectsInfo.replace("{n}", String(projects.length))),
    ).toBeInTheDocument();
    for (const p of projects) expect(w.getByRole("button", { name: p.title })).toBeInTheDocument();
    w.getByRole("button", { name: projects[0].title }).focus();
    await user.keyboard("{Enter}");
    expect(win("project:trip")).not.toHaveAttribute("hidden");
  });
});

describe("Project windows", () => {
  it("headings match the mockup: the trip and gift windows use their own heading", () => {
    const heading = (id: string) => {
      setup([`project:${id}` as WinId]);
      return within(win(`project:${id}`)).getByRole("heading").textContent;
    };
    expect(heading("trip")).toBe("Group trip planner");
    cleanup();
    expect(heading("gift")).toBe("The Perfect Gift Finder");
    cleanup();
    for (const p of projects) {
      setup([`project:${p.id}` as WinId]);
      expect(within(win(`project:${p.id}`)).getByRole("heading").textContent).toBe(p.heading);
      cleanup();
    }
  });

  it("trip has the guest note, an iframe with the embed URL and the link label", () => {
    setup(["project:trip"]);
    const w = within(win("project:trip"));
    const trip = projects.find((p) => p.id === "trip");
    if (!trip?.embed || !trip.link) throw new Error("trip fixture changed");
    expect(w.getByText(trip.embed.note)).toBeInTheDocument();
    const frame = win("project:trip").querySelector("iframe");
    expect(frame).toHaveAttribute("src", trip.embed.url);
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(w.getByRole("button", { name: trip.link.label })).toBeInTheDocument();
  });

  it("delulu link label mentions the password", () => {
    setup(["project:delulu"]);
    const label = projects.find((p) => p.id === "delulu")?.link?.label ?? "";
    expect(label).toMatch(/password/i);
    expect(within(win("project:delulu")).getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("a project without embed or link has no iframe and no link", () => {
    setup(["project:whereflix"]);
    const w = win("project:whereflix");
    expect(w.querySelector("iframe")).toBeNull();
    expect(w.querySelector("a")).toBeNull();
    expect(within(w).queryAllByRole("button")).toHaveLength(1);
  });

  it("the link goes through the leave alert", async () => {
    const user = setup(["project:trip"]);
    const label = projects.find((p) => p.id === "trip")?.link?.label ?? "";
    await user.click(within(win("project:trip")).getByRole("button", { name: label }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(copy.alerts.leave.text);
  });
});

describe("Trash", () => {
  const items = () =>
    within(win("trash"))
      .getAllByRole("listitem")
      .map((li) => li.textContent);

  it("lists tennis, singing, doctor, before and after Empty Trash", async () => {
    const user = setup(["trash"]);
    const captions = trash.map((t) => t.caption);
    expect(trash.map((t) => t.name)).toEqual(["tennis", "singing", "doctor"]);
    expect(items()).toEqual(captions);
    await user.click(
      within(win("trash")).getByRole("button", { name: copy.alerts.emptyTrash.empty }),
    );
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: copy.alerts.emptyTrash.empty,
      }),
    );
    expect(items()).toEqual(captions);
  });
});
