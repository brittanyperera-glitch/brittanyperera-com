// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appWindows } from "@/components/apps/appWindows";
import { Desktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { music } from "@/content/music";
import { photos } from "@/content/photos";
import type { WinId } from "@/lib/types";

function setup() {
  render(<Desktop windows={appWindows} />);
  return userEvent.setup();
}

const win = (name: string) => screen.getByLabelText(name, { selector: "section" });
const icon = (name: string) =>
  within(document.querySelector(".icons") as HTMLElement).getByRole("button", { name });

describe("new desktop apps", () => {
  const apps: { label: string; id: WinId; title: string }[] = [
    { label: music.folderTitle, id: "music", title: music.folderTitle },
    { label: photos.title, id: "photos", title: photos.title },
  ];

  for (const app of apps) {
    it(`${app.label}: the desktop icon opens its window, which holds only its title`, async () => {
      const user = setup();
      expect(win(app.title)).toHaveAttribute("hidden");
      await user.dblClick(icon(app.label));
      const w = win(app.title);
      expect(w).not.toHaveAttribute("hidden");
      expect(w).toHaveAttribute("data-win", app.id);
    });
  }

  it("renders a window for every new WinId", () => {
    setup();
    const ids: WinId[] = ["music", "garage", "photos"];
    for (const id of ids) {
      expect(document.querySelector(`section[data-win="${id}"]`), id).not.toBeNull();
    }
  });

  // Windows whose content is all Brittany's show only their title while that content is empty.
  // Reads the live content, so each window drops out of the check once her input lands.
  it("input-only windows render a title heading and nothing else while empty", () => {
    setup();
    const body = (id: string) =>
      document.querySelector(`section[data-win="${id}"] .body`) as HTMLElement;
    const empty = [
      ...(photos.albums.some((a) => a.items.length > 0) ? [] : [["photos", photos.title] as const]),
      ...(music.track ? [] : [["garage", music.appName] as const]),
    ];
    for (const [id, title] of empty) {
      expect(body(id).textContent, id).toBe(title);
      expect(body(id).querySelector("h3"), id).toHaveTextContent(title);
    }
  });

  it("has no Travel app: no window, desktop icon or View menu entry", () => {
    setup();
    expect(document.querySelector('section[data-win="travel"]')).toBeNull();
    expect(copy.desktopIcons.some((i) => /travel/i.test(i.label))).toBe(false);
    expect(copy.menus.view.some((m) => /travel/i.test(m.label))).toBe(false);
  });
});

describe("Music folder", () => {
  it("holds Garage Brittany alone, and opening it shows its window", async () => {
    const user = setup();
    await user.dblClick(icon(music.folderTitle));
    const folder = win(music.folderTitle);
    expect(folder.querySelectorAll(".body button")).toHaveLength(1);
    const section = document.querySelector('section[data-win="garage"]') as HTMLElement;
    expect(section).toHaveAttribute("hidden");
    await user.dblClick(within(folder).getByRole("button", { name: music.appName }));
    expect(section).not.toHaveAttribute("hidden");
  });

  it("has no instrument windows", () => {
    setup();
    expect(document.querySelector('section[data-win^="music:"]')).toBeNull();
    expect(win(music.appName)).toHaveAttribute("data-win", "garage");
  });
});

describe("View menu", () => {
  it("lists Music and Photos, each opening its window", async () => {
    const user = setup();
    for (const [label, id] of [
      [music.folderTitle, "music"],
      [photos.title, "photos"],
    ] as const) {
      await user.click(screen.getByRole("button", { name: "View" }));
      const menu = document.getElementById(
        screen.getByRole("button", { name: "View" }).getAttribute("aria-controls") as string,
      ) as HTMLElement;
      await user.click(within(menu).getByRole("button", { name: label }));
      expect(document.querySelector(`section[data-win="${id}"]`)).not.toHaveAttribute("hidden");
    }
  });
});
