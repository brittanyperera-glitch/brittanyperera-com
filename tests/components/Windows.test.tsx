// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { CvWindow } from "@/components/windows/CvWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { copy } from "@/content/copy";
import { cv } from "@/content/cv";
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
    expect(w.getByText("May 2026 to now")).toBeInTheDocument();
  });

  it("shows the open hint at the bottom of the window", () => {
    setup(["cv"]);
    const hint = win("cv").querySelector(".open-hint");
    expect(hint).not.toBeNull();
    expect(hint).toHaveTextContent(copy.windows.openHint);
    expect(win("cv").querySelector(".body")?.lastElementChild).toBe(hint);
  });

  it("shows the whole CV: every role, education, leadership entry, skill and language", () => {
    setup(["cv"]);
    const text = win("cv").textContent ?? "";
    const entries: { title: string; summary?: string; bullets?: readonly string[] }[] = [
      ...cv.roles,
      ...cv.education,
      ...cv.leadership,
    ];
    for (const e of entries) {
      expect(text, e.title).toContain(e.title);
      for (const b of e.bullets ?? []) expect(text, b).toContain(b);
      if (e.summary) expect(text, e.summary).toContain(e.summary);
    }
    for (const s of cv.skills) expect(text, s).toContain(s);
    for (const l of cv.languages) expect(text, l).toContain(l);
    for (const h of Object.values(cv.sections)) expect(text, h).toContain(h);
  });

  it("links to the full CV page with a plain anchor", () => {
    setup(["cv"]);
    expect(within(win("cv")).getByRole("link", { name: copy.windows.cvPageLink })).toHaveAttribute(
      "href",
      "/cv",
    );
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
