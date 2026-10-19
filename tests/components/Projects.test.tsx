// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { BrowserWindow } from "@/components/windows/BrowserWindow";
import { ProjectsWindow } from "@/components/windows/ProjectsWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { copy } from "@/content/copy";
import { projects, projectUi } from "@/content/projects";
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
    projects.flatMap((p) => [
      [`project:${p.id}`, <ProjectWindow key={p.id} project={p} />],
      [`browser:${p.id}`, <BrowserWindow key={`b${p.id}`} project={p} />],
    ]),
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
if (!trip || !delulu) throw new Error("projects must hold delulu and trip");
const aboutTitle = (title: string) => projectUi.aboutTitle.replace("{title}", title);

describe("project content", () => {
  it("holds only 100 Days of Delulu and Group Trip Hero, with their live sites", () => {
    expect(projects.map((p) => p.id).sort()).toEqual(["delulu", "trip"]);
    expect(delulu.title).toBe("100 Days of Delulu");
    expect(trip.title).toBe("Group Trip Hero");
    expect(delulu.siteUrl).toBe("https://100-days-of-delulu.vercel.app");
    expect(trip.siteUrl).toBe("https://grouptriphero.brittanyperera.com/#/guest");
    for (const p of projects) expect(typeof p.about).toBe("string");
  });
});

describe("Projects folder", () => {
  it("shows exactly two icons, and opening one opens its About window, not the site", async () => {
    const user = setup(["projects"]);
    const w = within(win("projects").querySelector(".body") as HTMLElement);
    expect(w.getAllByRole("button")).toHaveLength(2);
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
    setup(["project:trip"]);
    const w = win("project:trip");
    expect(w).toHaveAttribute("aria-label", aboutTitle(trip.title));
    expect(within(w).getByRole("heading").textContent).toBe(trip.title);
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

  it("has the open-the-site button as its default button", () => {
    setup(["project:delulu"]);
    const btn = within(win("project:delulu")).getByRole("button", { name: projectUi.openSite });
    expect(btn).toHaveClass("default");
  });

  it("open the site opens the browser window with the right iframe src", async () => {
    const user = setup(["project:trip"]);
    expect(frames()).toHaveLength(0);
    await user.click(within(win("project:trip")).getByRole("button", { name: projectUi.openSite }));
    expect(win("browser:trip")).not.toHaveAttribute("hidden");
    expect(frames()).toHaveLength(1);
    const frame = frames()[0];
    expect(frame).toHaveAttribute("src", trip.siteUrl);
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
    setup(["browser:delulu"]);
    const w = win("browser:delulu");
    expect(w).toHaveAttribute("aria-label", delulu.siteLabel);
    const field = within(w).getByRole("textbox", { name: projectUi.address });
    expect(field).toHaveValue(delulu.siteUrl);
    expect(field).toHaveAttribute("readonly");
    expect(w.querySelector(".browser-throbber svg")).not.toBeNull();
    expect(w.textContent ?? "").not.toMatch(/netscape|explorer|navigator/i);
  });

  it("Reload remounts the frame on the same URL", async () => {
    const user = setup(["browser:delulu"]);
    const before = frames()[0];
    await user.click(within(win("browser:delulu")).getByRole("button", { name: projectUi.reload }));
    const after = frames()[0];
    expect(frames()).toHaveLength(1);
    expect(after).not.toBe(before);
    expect(after).toHaveAttribute("src", delulu.siteUrl);
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
