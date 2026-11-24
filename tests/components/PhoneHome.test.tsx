// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";

function renderHome() {
  const view = render(<Desktop windows={{}} />);
  const home = view.container.querySelector(".phone-home") as HTMLElement;
  return { ...view, home, ui: within(home) };
}

const dock = (home: HTMLElement) =>
  [...home.querySelectorAll<HTMLElement>(".phone-dock [data-open]")].map((e) => e.dataset.open);

const mockMedia = (matching: string[]) =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

beforeEach(() => {
  window.localStorage.clear();
  mockMedia(["(max-width: 700px)"]);
});
afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("phone home screen (server markup)", () => {
  it("has a status bar with her name and a client-filled clock", () => {
    const { container } = renderHome();
    const bar = container.querySelector(".phone-status") as HTMLElement;
    expect(bar).toHaveTextContent(copy.phone.statusName);
    expect(bar.querySelector(".status-clock")).toHaveTextContent(/\d/);
  });

  it("shows seven apps, three in the grid and four in the neutral dock, and no CV Builder", () => {
    const { home } = renderHome();
    const grid = [...home.querySelectorAll<HTMLElement>(".phone-grid [data-open]")].map(
      (e) => e.dataset.open,
    );
    expect(dock(home)).toEqual(copy.phone.docks.none);
    expect(grid).toHaveLength(3);
    expect([...grid, ...dock(home)].sort()).toEqual([...copy.phone.apps].sort());
    expect(home.querySelector('[data-open="cvbuilder"]')).toBeNull();
  });

  it("labels every app from the desktop icon copy, with an svg icon", () => {
    const { ui } = renderHome();
    for (const ic of copy.desktopIcons.filter((i) => copy.phone.apps.includes(i.open))) {
      expect(ui.getByRole("button", { name: ic.label }).querySelector("svg")).not.toBeNull();
    }
  });

  it("carries the who's-visiting card and the laptop footer, with no desktop-version link", () => {
    const { home, ui } = renderHome();
    expect(ui.getByText(copy.phone.who.question)).toBeInTheDocument();
    for (const v of copy.setup.visitors) {
      expect(ui.getByRole("button", { name: v.label })).toBeInTheDocument();
    }
    expect(home).toHaveTextContent("the full mac version is on a laptop");
    expect(screen.queryByRole("link", { name: /desktop version/i })).toBeNull();
  });

  it("one tap on an app opens just that window", () => {
    const { ui } = renderHome();
    fireEvent.click(ui.getByRole("button", { name: "Contact" }));
    expect(
      [...document.querySelectorAll<HTMLElement>("section[data-win]:not([hidden])")].map(
        (w) => w.dataset.win,
      ),
    ).toEqual(["contact"]);
  });

  it("picking a visitor re-docks, marks the pill, shows the hint and stores the choice", () => {
    const { home, ui } = renderHome();
    const pill = ui.getByRole("button", { name: "I'm hiring" });
    expect(pill).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(pill);
    expect(pill).toHaveAttribute("aria-pressed", "true");
    expect(dock(home)).toEqual(copy.phone.docks.recruiter);
    expect(home).toHaveTextContent("CV and background first, theyre in the dock");
    expect(JSON.parse(window.localStorage.getItem("bp:setup-done") ?? "null")).toEqual({
      visitor: "recruiter",
    });
  });

  it("is out of the accessibility tree and inert on a laptop, so its apps never shadow the desktop icons", () => {
    mockMedia([]);
    const { home } = renderHome();
    expect(home).toHaveAttribute("inert");
    expect(home).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByRole("button", { name: "CV" })).toHaveLength(1);
  });

  it("goes inert while an app is open so Tab cannot reach it behind the app", () => {
    const { home, ui } = renderHome();
    expect(home).not.toHaveAttribute("inert");
    fireEvent.click(ui.getByRole("button", { name: "Trash" }));
    expect(home).toHaveAttribute("inert");
  });
});
