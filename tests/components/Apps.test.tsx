// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { appWindows } from "@/components/apps/appWindows";
import { Desktop } from "@/components/desktop/Desktop";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import { cvBuilder } from "@/content/cvbuilder";
import { music } from "@/content/music";
import { photos } from "@/content/photos";
import { travel } from "@/content/travel";
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
    { label: cvBuilder.title, id: "cvbuilder", title: cvBuilder.title },
    { label: music.folderTitle, id: "music", title: music.folderTitle },
    { label: travel.title, id: "travel", title: travel.title },
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

  it("puts CV Builder right after CV in the desktop icon order", () => {
    const labels = copy.desktopIcons.map((i) => i.label);
    expect(labels.indexOf(cvBuilder.title)).toBe(labels.indexOf("CV") + 1);
  });

  it("renders a window for every new WinId", () => {
    setup();
    const ids: WinId[] = [
      "cvbuilder",
      "music",
      "music:guitar",
      "music:piano",
      "music:ukulele",
      "garage",
      "travel",
      "photos",
    ];
    for (const id of ids) {
      expect(document.querySelector(`section[data-win="${id}"]`), id).not.toBeNull();
    }
  });

  it("stub windows render a title heading and nothing else", () => {
    setup();
    const body = (id: string) =>
      document.querySelector(`section[data-win="${id}"] .body`) as HTMLElement;
    for (const [id, title] of [
      ["cvbuilder", cvBuilder.title],
      ["travel", travel.title],
      ["photos", photos.title],
      ["garage", music.appName],
    ] as const) {
      expect(body(id).textContent, id).toBe(title);
      expect(body(id).querySelector("h3"), id).toHaveTextContent(title);
    }
  });
});

describe("Music folder", () => {
  it("lists three instruments and Garage Brittany, each opening its window", async () => {
    const user = setup();
    await user.dblClick(icon(music.folderTitle));
    const folder = win(music.folderTitle);
    const targets: [string, string][] = [
      ...music.instruments.map((i) => [i.name, `music:${i.id}`] as [string, string]),
      [music.appName, "garage"],
    ];
    expect(within(folder).getAllByRole("button")).toHaveLength(targets.length + 1);
    for (const [name, id] of targets) {
      const section = document.querySelector(`section[data-win="${id}"]`) as HTMLElement;
      expect(section).toHaveAttribute("hidden");
      await user.dblClick(within(folder).getByRole("button", { name }));
      expect(section).not.toHaveAttribute("hidden");
    }
  });

  it("titles each instrument window with the instrument name", () => {
    setup();
    for (const i of music.instruments) {
      expect(document.querySelector(`section[data-win="music:${i.id}"]`)).toHaveAttribute(
        "aria-label",
        i.name,
      );
    }
    expect(win(music.appName)).toHaveAttribute("data-win", "garage");
  });

  it("an instrument window shows only its name as a heading", async () => {
    const user = setup();
    await user.dblClick(icon(music.folderTitle));
    await user.dblClick(
      within(win(music.folderTitle)).getByRole("button", { name: music.instruments[0].name }),
    );
    const body = document.querySelector(
      `section[data-win="music:${music.instruments[0].id}"] .body`,
    ) as HTMLElement;
    expect(within(body).getByRole("heading", { level: 3 })).toHaveTextContent(
      music.instruments[0].name,
    );
  });
});

describe("YouTube icon", () => {
  const original = contact.youtube;
  afterEach(() => {
    contact.youtube = original;
  });

  it("is absent while contact.youtube is undefined", () => {
    contact.youtube = undefined;
    setup();
    expect(screen.queryByRole("button", { name: contact.youtubeLabel })).toBeNull();
  });

  it("is present when set, opens no window, and runs the leave alert", async () => {
    contact.youtube = "https://www.youtube.com/@example";
    const user = setup();
    const yt = icon(contact.youtubeLabel);
    expect(yt.hasAttribute("data-open")).toBe(false);
    await user.dblClick(yt);
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(copy.alerts.leave.text);
    expect(document.querySelectorAll("section[data-win]:not([hidden])")).toHaveLength(0);
  });

  it("Enter on the focused icon runs the leave alert", async () => {
    contact.youtube = "https://www.youtube.com/@example";
    const user = setup();
    icon(contact.youtubeLabel).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(copy.alerts.leave.text);
  });
});

describe("View menu", () => {
  it("lists Music, Travel, Photos and CV Builder, each opening its window", async () => {
    const user = setup();
    for (const [label, id] of [
      [music.folderTitle, "music"],
      [travel.title, "travel"],
      [photos.title, "photos"],
      [cvBuilder.title, "cvbuilder"],
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
