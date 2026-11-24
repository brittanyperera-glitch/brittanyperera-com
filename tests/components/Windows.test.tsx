// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { CvWindow } from "@/components/windows/CvWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
import { projects, projectUi, siteProjects } from "@/content/projects";
import { trash } from "@/content/trash";
import { windowBox } from "@/content/windowbox";
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
  trash: <TrashWindow />,
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
  it("lists the new roles in order", () => {
    setup(["cv"]);
    const w = within(win("cv"));
    // The full CV mentions Mercedes twice (role and master's project), so allow repeats.
    for (const t of [
      "AI Software Engineer",
      "VietJet Air",
      "Oakley Tutors",
      "Mercedes-AMG Petronas F1",
    ])
      expect(w.getAllByText(t, { exact: false }).length).toBeGreaterThan(0);
  });

  it("has no see-the-full-CV link: the whole CV is already in the window", () => {
    setup(["cv"]);
    expect(within(win("cv")).queryByRole("link", { name: /full CV/i })).toBeNull();
    expect(win("cv").querySelector('a[href="/cv"]')).toBeNull();
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
    expect(w.getByText("May 2026 to now")).toBeInTheDocument();
  });

  it("shows the open hint at the bottom of the window", () => {
    setup(["cv"]);
    const hint = win("cv").querySelector(".open-hint");
    expect(hint).not.toBeNull();
    expect(hint).toHaveTextContent(copy.windows.openHint);
    expect(win("cv").querySelector(".body")?.lastElementChild).toBe(hint);
  });

  it("shows the whole CV: every role, project, education, leadership entry, skill and language", () => {
    setup(["cv"]);
    const text = win("cv").textContent ?? "";
    const entries: { title: string; summary?: string; bullets?: readonly string[] }[] = [
      ...cv.roles,
      ...cv.projects,
      ...cv.education,
      ...cv.leadership,
    ];
    for (const e of entries) {
      expect(text, e.title).toContain(e.title);
      for (const b of e.bullets ?? []) expect(text, b).toContain(b);
      if (e.summary) expect(text, e.summary).toContain(e.summary);
    }
    for (const [label, items] of cv.skills) {
      expect(text, label).toContain(label);
      expect(text, items).toContain(items);
    }
    expect(text, cv.languages).toContain(cv.languages);
    for (const h of Object.values(cv.sections)) expect(text, h).toContain(h);
  });

  it("holds every CV section heading", () => {
    setup(["cv"]);
    const w = within(win("cv"));
    for (const h of Object.values(cv.sections))
      expect(w.getByRole("heading", { name: h })).toBeVisible();
  });
});

describe("Title bar boxes", () => {
  const box = (name: string) => within(win("cv")).getByRole("button", { name });
  const at = () => {
    const { left, top, width } = win("cv").style;
    return { left, top, width };
  };

  it("labels the zoom and collapse boxes as buttons", () => {
    setup(["cv"]);
    expect(box(windowBox.zoom)).toBeInTheDocument();
    expect(box(windowBox.collapse)).toBeInTheDocument();
    expect(win("cv").querySelector("span.zoom, span.shade")).toBeNull();
  });

  it("zoom fills the screen below the menu bar, and a second click restores the box", async () => {
    const user = setup(["cv"]);
    const before = at();
    await user.click(box(windowBox.zoom));
    expect(win("cv")).toHaveClass("zoomed");
    expect(at()).toEqual({ left: "0px", top: "24px", width: "100vw" });
    expect(win("cv").style.height).toBe("calc(100vh - 24px)");
    await user.click(box(windowBox.zoomBack));
    expect(win("cv")).not.toHaveClass("zoomed");
    expect(at()).toEqual(before);
  });

  it("collapse hides the body and keeps the title bar, and a second click shows it", async () => {
    const user = setup(["cv"]);
    const body = win("cv").querySelector(".body") as HTMLElement;
    expect(body).toBeVisible();
    await user.click(box(windowBox.collapse));
    expect(body).not.toBeVisible();
    expect(win("cv").querySelector(".titlebar")).toBeVisible();
    await user.click(box(windowBox.expand));
    expect(body).toBeVisible();
  });

  it("a zoomed window is not dragged by its title bar", () => {
    setup(["cv"]);
    fireEvent.click(box(windowBox.zoom));
    const bar = win("cv").querySelector(".titlebar") as HTMLElement;
    fireEvent.pointerDown(bar, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(bar, { clientX: 300, clientY: 300 });
    expect(at().left).toBe("0px");
    expect(at().top).toBe("24px");
  });

  it("the phone title bar has neither box", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;
    try {
      setup(["cv"]);
      expect(within(win("cv")).queryByRole("button", { name: windowBox.zoom })).toBeNull();
      expect(within(win("cv")).queryByRole("button", { name: windowBox.collapse })).toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });

  it("draws no resize grip", () => {
    const css = readFileSync("src/styles/platinum.css", "utf8");
    expect(css).not.toMatch(/\.win::after/);
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

describe("Phone app nav bar", () => {
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  const back = (id: string) => {
    const b = win(id).querySelector<HTMLButtonElement>(".titlebar .close");
    if (!b) throw new Error(`no close button in ${id}`);
    return b;
  };
  const label = (id: string) => back(id).querySelector(".close-label")?.textContent;

  it("a top-level app's back button says Home and keeps the .close class", () => {
    setup(["projects"]);
    expect(copy.chrome.home).toBe("Home");
    expect(label("projects")).toBe(copy.chrome.home);
    expect(back("projects")).toHaveAccessibleName(copy.chrome.home);
  });

  it("a project says the parent window's title, and pressing it returns there", async () => {
    const id = `project:${projects[0].id}` as WinId;
    const user = setup([id]);
    expect(label(id)).toBe(copy.windowTitles.projects);
    await user.click(back(id));
    expect(win(id)).toHaveAttribute("hidden");
    expect(win("projects")).not.toHaveAttribute("hidden");
  });

  it("a project's site says the project's title, one level up", () => {
    const site = siteProjects[0];
    expect(site).toBeDefined();
    const id = `browser:${site.id}` as WinId;
    setup([id]);
    expect(label(id)).toBe(projectUi.aboutTitle.replace("{title}", site.title));
  });

  it("the CV puts Download PDF above its first section heading", () => {
    setup(["cv"]);
    const w = win("cv");
    const download = within(w).getByRole("button", { name: "Download PDF" });
    const first = w.querySelector(".cv-doc h4");
    if (!first) throw new Error("no section heading");
    expect(download.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
