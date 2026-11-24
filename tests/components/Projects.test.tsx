// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { BrowserWindow } from "@/components/windows/BrowserWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { copy } from "@/content/copy";
import { projects, projectUi, siteProjects } from "@/content/projects";
import type { WinId } from "@/lib/types";

function Opener({ ids }: { ids: WinId[] }) {
  const { open } = useDesktop();
  useEffect(() => {
    for (const id of ids) open(id);
  }, [ids, open]);
  return null;
}

const windows: Partial<Record<WinId, ReactNode>> = {
  projects: <ProjectsWindow />,
  ...Object.fromEntries(
    projects.flatMap((p) => [[`project:${p.id}`, <ProjectWindow key={p.id} project={p} />]]),
  ),
  ...Object.fromEntries(
    siteProjects.map((p) => [`browser:${p.id}`, <BrowserWindow key={`b${p.id}`} project={p} />]),
  ),
};

function setup(ids: WinId[] = [], map: Partial<Record<WinId, ReactNode>> = windows) {
  render(
    <Desktop windows={map}>
      <Opener ids={ids} />
    </Desktop>,
  );
  return userEvent.setup();
}

const win = (id: string): HTMLElement => {
  const el = document.querySelector<HTMLElement>(`section[data-win="${id}"]`);
  if (!el) throw new Error(`no window ${id}`);
  return el;
};
const frames = () => document.querySelectorAll("iframe");
const trip = projects.find((p) => p.id === "trip");
const delulu = projects.find((p) => p.id === "delulu");
const site = siteProjects.find((p) => p.id === "trip");
if (!trip || !delulu || !site) throw new Error("projects must hold delulu and trip");
const aboutTitle = (title: string) => projectUi.aboutTitle.replace("{title}", title);

describe("project content", () => {
  it("holds only 100 Days of Delulu and Group Trip Hero, with their live sites", () => {
    expect(projects.map((p) => p.id).sort()).toEqual([
      "agents",
      "delulu",
      "engine",
      "radiator",
      "site",
      "trip",
    ]);
    expect(delulu.title).toBe("100 Days of Delulu");
    expect(trip.title).toBe("Group Trip Hero");
    expect(delulu.siteUrl).toBeUndefined();
    expect(delulu.siteLabel).toBeUndefined();
    expect(site.siteUrl).toBe("https://grouptriphero.brittanyperera.com/#/guest");
    expect(siteProjects.map((p) => p.id)).toEqual(["trip"]);
    for (const p of projects) expect(typeof p.about).toBe("string");
  });
});

const noCase = {
  problem: undefined,
  built: undefined,
  hardest: undefined,
  result: undefined,
  stack: undefined,
  links: undefined,
};

describe("Projects folder", () => {
  it("shows exactly six icons, and opening one opens its About window, not the site", async () => {
    const user = setup(["projects"]);
    const w = within(win("projects").querySelector(".body") as HTMLElement);
    expect(w.getAllByRole("button")).toHaveLength(6);
    expect(
      w.getByText(copy.windows.projectsInfo.replace("{n}", String(projects.length))),
    ).toBeInTheDocument();
    w.getByRole("button", { name: trip.title }).focus();
    await user.keyboard("{Enter}");
    expect(win("project:trip")).not.toHaveAttribute("hidden");
    expect(win("browser:trip")).toHaveAttribute("hidden");
  });
});

describe("About window", () => {
  it("is titled About <project> and holds the title and one button when the about text is empty", () => {
    setup(["project:trip"], {
      "project:trip": <ProjectWindow project={{ ...trip, ...noCase, about: "" }} />,
    });
    const w = win("project:trip");
    expect(w).toHaveAttribute("aria-label", aboutTitle(trip.title));
    expect(within(w).getByRole("heading", { level: 3 }).textContent).toBe(trip.title);
    expect(within(w.querySelector(".body") as HTMLElement).getAllByRole("button")).toHaveLength(1);
    expect(w.querySelector("iframe")).toBeNull();
    expect(w.querySelector(".body p:not(.actions-right)")).toBeNull();
  });

  it("plays the Delulu promo, loading nothing until asked", () => {
    const delulu = projects.find((p) => p.id === "delulu");
    if (!delulu?.video) throw new Error("Delulu has no promo video in content");
    setup(["project:delulu"]);
    const video = win("project:delulu").querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("src", delulu.video.src);
    expect(video).toHaveAttribute("poster", delulu.video.poster);
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("aria-label", delulu.video.label);
    expect(win("project:trip").querySelector("video")).toBeNull();
  });

  it("shows the about text when there is one", () => {
    setup(["project:trip"], {
      "project:trip": <ProjectWindow project={{ ...trip, about: "fixture about" }} />,
    });
    expect(within(win("project:trip")).getByText("fixture about")).toBeInTheDocument();
  });

  it("has the open-the-site button as Group Trip's default button", () => {
    setup(["project:trip"]);
    const btn = within(win("project:trip")).getByRole("button", { name: projectUi.openSite });
    expect(btn).toHaveClass("default");
  });

  it("Delulu offers view the code, not the live site, and no link to the live site", () => {
    setup(["project:delulu"]);
    const w = within(win("project:delulu"));
    expect(w.getByRole("button", { name: projectUi.viewCode })).toHaveClass("default");
    expect(w.queryByRole("button", { name: projectUi.openSite })).toBeNull();
    expect(win("project:delulu").innerHTML).not.toContain("100-days-of-delulu.vercel.app");
  });

  it("view the code opens the template repo in a new tab, through the leave alert, no frame", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const user = setup(["project:delulu"]);
    await user.click(
      within(win("project:delulu")).getByRole("button", { name: projectUi.viewCode }),
    );
    const alert = await screen.findByRole("alertdialog");
    await user.click(within(alert).getByRole("button", { name: copy.alerts.leave.ok }));
    expect(open).toHaveBeenCalledWith(
      "https://github.com/brittanyperera-glitch/delulu-template",
      "_blank",
      "noopener",
    );
    expect(document.querySelector('section[data-win="browser:delulu"]')).toBeNull();
    expect(frames()).toHaveLength(0);
    open.mockRestore();
  });

  it("open the site opens the browser window with the right iframe src", async () => {
    const user = setup(["project:trip"]);
    expect(frames()).toHaveLength(0);
    await user.click(within(win("project:trip")).getByRole("button", { name: projectUi.openSite }));
    expect(win("browser:trip")).not.toHaveAttribute("hidden");
    expect(frames()).toHaveLength(1);
    const frame = frames()[0];
    expect(frame).toHaveAttribute("src", site.siteUrl);
    expect(frame).toHaveAttribute("title", trip.title);
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(frame).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups",
    );
  });
});

describe("Browser window", () => {
  it("carries a read-only location field with the URL, a throbber and no brand names", () => {
    setup(["browser:trip"]);
    const w = win("browser:trip");
    expect(w).toHaveAttribute("aria-label", site.siteLabel);
    const field = within(w).getByRole("textbox", { name: projectUi.address });
    expect(field).toHaveValue(site.siteUrl);
    expect(field).toHaveAttribute("readonly");
    expect(w.querySelector(".browser-throbber svg")).not.toBeNull();
    expect(w.textContent ?? "").not.toMatch(/netscape|explorer|navigator/i);
  });

  it("Reload remounts the frame on the same URL", async () => {
    const user = setup(["browser:trip"]);
    const before = frames()[0];
    await user.click(within(win("browser:trip")).getByRole("button", { name: projectUi.reload }));
    const after = frames()[0];
    expect(frames()).toHaveLength(1);
    expect(after).not.toBe(before);
    expect(after).toHaveAttribute("src", site.siteUrl);
  });

  it("open in a new tab goes through the leave alert", async () => {
    const user = setup(["browser:trip"]);
    await user.click(within(win("browser:trip")).getByRole("button", { name: projectUi.newTab }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(copy.alerts.leave.text);
  });

  it("closing the window unloads the iframe", async () => {
    const user = setup(["browser:trip"]);
    expect(frames()).toHaveLength(1);
    await user.click(within(win("browser:trip")).getByRole("button", { name: copy.chrome.close }));
    expect(win("browser:trip")).toHaveAttribute("hidden");
    expect(frames()).toHaveLength(0);
  });

  it("loads no frame until the window is opened", () => {
    setup([]);
    expect(frames()).toHaveLength(0);
  });
});

describe("case-study template", () => {
  const full = {
    ...trip,
    problem: "fixture problem",
    built: "fixture built",
    hardest: "fixture hardest",
    result: "fixture result",
    stack: ["Next.js", "Postgres"],
    links: { live: "https://example.com/live", repo: "https://example.com/repo" },
    image: { src: "/fixture.png", alt: "fixture alt", width: 640, height: 360 },
  };
  const headingsOf = (w: HTMLElement) =>
    within(w)
      .getAllByRole("heading")
      .map((h) => h.textContent);
  const linksOf = (w: HTMLElement) =>
    within(w)
      .queryAllByRole("link")
      .map((a) => a.getAttribute("href"));

  it("renders every heading in order, the links, the stack and the image", () => {
    setup(["project:trip"], { "project:trip": <ProjectWindow project={full} /> });
    const w = win("project:trip");
    const s = projectUi.sections;
    expect(headingsOf(w)).toEqual([
      trip.title,
      s.problem,
      s.built,
      s.hardest,
      s.result,
      s.stack,
      s.links,
    ]);
    expect(linksOf(w)).toEqual(["https://example.com/live", "https://example.com/repo"]);
    expect(within(w).getByText("Postgres")).toBeInTheDocument();
    expect(within(w).getByAltText("fixture alt")).toHaveAttribute("src", "/fixture.png");
  });

  it("a case-study link goes through the leave alert, then opens in a new tab", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const user = setup(["project:trip"], { "project:trip": <ProjectWindow project={full} /> });
    await user.click(
      within(win("project:trip")).getByRole("link", { name: projectUi.linkLabels.repo }),
    );
    expect(open).not.toHaveBeenCalled();
    const alert = await screen.findByRole("alertdialog");
    await user.click(within(alert).getByRole("button", { name: copy.alerts.leave.ok }));
    expect(open).toHaveBeenCalledWith("https://example.com/repo", "_blank", "noopener");
    open.mockRestore();
  });

  it("gives the image its width and height", () => {
    setup(["project:trip"], { "project:trip": <ProjectWindow project={full} /> });
    const img = within(win("project:trip")).getByAltText("fixture alt");
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveAttribute("height", "360");
  });

  it("renders only the sections that are present", () => {
    setup(["project:trip"], {
      "project:trip": <ProjectWindow project={{ ...trip, ...noCase, result: "just this" }} />,
    });
    expect(headingsOf(win("project:trip"))).toEqual([trip.title, projectUi.sections.result]);
  });

  it("the two real projects render only their title, buttons and promo", () => {
    setup(["project:trip", "project:delulu"], {
      "project:trip": <ProjectWindow project={{ ...trip, ...noCase }} />,
      "project:delulu": <ProjectWindow project={{ ...delulu, ...noCase }} />,
    });
    expect(headingsOf(win("project:trip"))).toEqual(["Group Trip Hero"]);
    expect(headingsOf(win("project:delulu"))).toEqual(["100 Days of Delulu"]);
    expect(linksOf(win("project:trip"))).toEqual([]);
    expect(linksOf(win("project:delulu"))).toEqual([]);
    expect(win("project:trip").querySelector(".case-section, .case-image")).toBeNull();
    expect(win("project:delulu").querySelector(".case-section, .case-image")).toBeNull();
  });
});
