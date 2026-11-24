// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PhotosWindow } from "@/components/apps/PhotosWindow";
import { YouTubeWindow } from "@/components/apps/YouTubeWindow";
import { Desktop } from "@/components/desktop/Desktop";
import { type PhotoAlbum, photos } from "@/content/photos";
import { youtube } from "@/content/youtube";

const item = (name: string) => ({
  src: `/photos/${name}.jpg`,
  alt: `Fixture ${name}`,
  caption: `caption ${name}`,
});

// Content order is kept as given; empty albums are filtered out by the window.
const fixtures: PhotoAlbum[] = [
  { id: "vietnam", title: "Vietnam", videoIds: [youtube.videos[1].id], items: [item("v1")] },
  { id: "empty", title: "Empty album", items: [] },
  { id: "general", title: "General", items: [item("alpha"), item("beta"), item("gamma")] },
  { id: "morocco", title: "Morocco", items: [item("m1"), item("m2")] },
];

const ui = photos.ui;
const counter = (n: number, total: number) =>
  ui.counter.replace("{n}", String(n)).replace("{total}", String(total));

function setup(albums: PhotoAlbum[] = fixtures) {
  render(
    <Desktop windows={{ photos: <PhotosWindow albums={albums} />, youtube: <YouTubeWindow /> }} />,
  );
  return userEvent.setup();
}

type User = ReturnType<typeof userEvent.setup>;

const win = () => screen.getByLabelText(photos.title, { selector: "section" });
const body = () => win().querySelector(".body") as HTMLElement;
const icon = (name: string) =>
  within(document.querySelector(".icons") as HTMLElement).getByRole("button", { name });

async function openPhotos(user: User) {
  await user.dblClick(icon(photos.title));
}

const tile = (title: string) =>
  within(body()).getByRole("button", { name: new RegExp(`^${title}`) });
const thumb = (alt: string) => within(body()).getByRole("button", { name: alt });

async function openGrid(user: User, title: string) {
  await openPhotos(user);
  await user.click(tile(title));
}

// Albums, then the album's grid, then its first photo.
async function openAlbum(user: User, title: string) {
  await openGrid(user, title);
  await user.click(within(body()).getAllByRole("button", { name: /^Fixture / })[0]);
}

const slider = () => within(body()).getByRole("slider");

describe("Photos content", () => {
  it("has no empty album", () => {
    for (const a of photos.albums) expect(a.items.length).toBeGreaterThan(0);
  });

  it("names an album with photos to open on", () => {
    const album = photos.albums.find((a) => a.id === photos.openAlbum);
    expect(album?.items.length).toBeGreaterThan(0);
  });
});

describe("Photos opening album", () => {
  it("opens straight on the openAlbum album as a photo grid, not a list or a viewer", async () => {
    const user = setup([
      ...fixtures,
      { id: photos.openAlbum, title: "Opener", items: [item("o1"), item("o2")] },
    ]);
    await openPhotos(user);
    expect(thumb("Fixture o1")).toBeInTheDocument();
    expect(thumb("Fixture o2")).toBeInTheDocument();
    expect(within(body()).queryByRole("slider")).toBeNull();
  });

  it("album view shows one thumbnail button per item with its alt, sized, lazy after the first row", async () => {
    const many = Array.from({ length: 5 }, (_, i) => item(`g${i}`));
    const user = setup([{ id: "general", title: "General", items: many }]);
    await openGrid(user, "General");
    const thumbs = within(body()).getAllByRole("button", { name: /^Fixture g/ });
    expect(thumbs).toHaveLength(5);
    for (const [i, b] of thumbs.entries()) {
      const img = within(b).getByRole("img", { name: `Fixture g${i}` });
      expect(img).toHaveAttribute("src", `/photos/g${i}.jpg`);
      expect(img).toHaveAttribute("width");
      expect(img).toHaveAttribute("height");
      expect(img).toHaveAttribute("loading", i < 3 ? "eager" : "lazy");
    }
  });

  it("clicking thumbnail N opens the viewer at N", async () => {
    const user = setup();
    await openGrid(user, "General");
    await user.click(thumb("Fixture beta"));
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption beta")).toBeInTheDocument();
  });

  it("Enter on a focused thumbnail opens it", async () => {
    const user = setup();
    await openGrid(user, "General");
    thumb("Fixture gamma").focus();
    await user.keyboard("{Enter}");
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
  });

  it("viewer back returns to the grid and focuses thumbnail N", async () => {
    const user = setup();
    await openGrid(user, "General");
    await user.click(thumb("Fixture beta"));
    await user.click(within(body()).getByRole("button", { name: ui.backToGrid }));
    expect(document.activeElement).toBe(thumb("Fixture beta"));
    await user.click(thumb("Fixture gamma"));
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(thumb("Fixture gamma"));
  });

  it("shows the album list when openAlbum is not among the albums", async () => {
    const user = setup();
    await openPhotos(user);
    expect(tile("General")).toBeInTheDocument();
  });
});

describe("Photos album list", () => {
  it("shows one tile per album that has items, in content order, with a cover and a count", async () => {
    const user = setup();
    await openPhotos(user);
    const tiles = within(body()).getAllByRole("button");
    expect(tiles.map((b) => b.textContent)).toEqual([
      `Vietnam${ui.countOne}`,
      `General${ui.countMany.replace("{n}", "3")}`,
      `Morocco${ui.countMany.replace("{n}", "2")}`,
    ]);
    const covers = [...body().querySelectorAll("img")];
    expect(covers.map((i) => i.getAttribute("src"))).toEqual([
      "/photos/v1.jpg",
      "/photos/alpha.jpg",
      "/photos/m1.jpg",
    ]);
    expect(within(body()).queryByRole("button", { name: /Empty album/ })).toBeNull();
  });

  it("holds only its title with no album that has items", async () => {
    const user = setup([{ id: "general", title: "General", items: [] }]);
    await openPhotos(user);
    expect(body().textContent).toBe(photos.title);
    expect(within(body()).queryAllByRole("button")).toHaveLength(0);
  });

  it("opening an album shows its first photo, caption and counter from content", async () => {
    const user = setup();
    await openAlbum(user, "General");
    expect(within(body()).getByRole("img", { name: "Fixture alpha" })).toHaveAttribute(
      "src",
      "/photos/alpha.jpg",
    );
    expect(within(body()).getByText("caption alpha")).toBeInTheDocument();
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    expect(within(body()).queryByRole("button", { name: /^Vietnam/ })).toBeNull();
  });
});

describe("Photos viewer", () => {
  it("shows one photo per page, the caption under it", async () => {
    const user = setup();
    await openAlbum(user, "General");
    expect(body().querySelectorAll("img")).toHaveLength(1);
    const stage = body().querySelector(".photo-stage") as HTMLElement;
    const caption = within(body()).getByText("caption alpha");
    expect(stage.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("Next and Previous wrap around and move the counter", async () => {
    const user = setup();
    await openAlbum(user, "General");
    await user.click(within(body()).getByRole("button", { name: ui.prev }));
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption gamma")).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: ui.next }));
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption alpha")).toBeInTheDocument();
  });

  it("has a range input as the scroll bar, in step with the page", async () => {
    const user = setup();
    await openAlbum(user, "General");
    expect(slider()).toHaveAttribute("min", "1");
    expect(slider()).toHaveAttribute("max", "3");
    expect(slider()).toHaveAccessibleName(ui.scroll);
    expect(slider()).toHaveValue("1");
    fireEvent.change(slider(), { target: { value: "3" } });
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption gamma")).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: ui.prev }));
    expect(slider()).toHaveValue("2");
  });

  it("arrow keys step through photos while the window is front", async () => {
    const user = setup();
    await openAlbum(user, "General");
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
  });

  it("arrow keys do nothing once another window is in front", async () => {
    const user = setup();
    await openAlbum(user, "General");
    await user.dblClick(icon("YouTube"));
    expect(win()).not.toHaveClass("front");
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
  });

  it("leaves arrow keys to the scroll bar when it has focus, so a press moves one page", async () => {
    const user = setup();
    await openAlbum(user, "General");
    slider().focus();
    fireEvent.keyDown(slider(), { key: "ArrowRight", bubbles: true });
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
  });

  it("Back and Escape step out a level at a time, to the grid and then the album list", async () => {
    const user = setup();
    await openAlbum(user, "General");
    await user.click(within(body()).getByRole("button", { name: ui.backToGrid }));
    expect(thumb("Fixture beta")).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: ui.back }));
    expect(tile("General")).toHaveFocus();
    await user.click(tile("Morocco"));
    await user.click(thumb("Fixture m1"));
    expect(within(body()).getByText(counter(1, 2))).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(within(body()).queryByText("caption m1")).toBeNull();
    expect(thumb("Fixture m2")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(tile("General")).toBeInTheDocument();
  });

  it("arrow keys in the grid do not turn pages", async () => {
    const user = setup();
    await openGrid(user, "General");
    await user.keyboard("{ArrowRight}");
    expect(within(body()).queryByRole("slider")).toBeNull();
  });

  it("opening a photo puts focus on the viewer's first button, not the page body", async () => {
    const user = setup();
    await openAlbum(user, "General");
    expect(document.activeElement).toBe(
      within(body()).getByRole("button", { name: ui.backToGrid }),
    );
  });

  it("one Escape closes an open menu and leaves the album where it is", async () => {
    const user = setup();
    await openAlbum(user, "General");
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    expect(file).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(file).toHaveAttribute("aria-expanded", "false");
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(thumb("Fixture alpha")).toBeInTheDocument();
  });

  it("an album without videos has no watch button", async () => {
    const user = setup();
    await openAlbum(user, "General");
    expect(within(body()).queryByRole("button", { name: ui.watchVideo })).toBeNull();
  });

  it("watch the video opens the YouTube window playing that video", async () => {
    const user = setup();
    await openAlbum(user, "Vietnam");
    const youtubeWin = screen.getByLabelText(youtube.ui.title, { selector: "section" });
    expect(youtubeWin).toHaveAttribute("hidden");
    await user.click(within(body()).getByRole("button", { name: ui.watchVideo }));
    expect(youtubeWin).not.toHaveAttribute("hidden");
    const frame = youtubeWin.querySelector("iframe");
    expect(frame).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${youtube.videos[1].id}?autoplay=1`,
    );
    expect(frame).toHaveAttribute("title", youtube.videos[1].title);
  });

  it("asking for another video later switches the already open YouTube window", async () => {
    const user = setup([
      { id: "a", title: "A", videoIds: [youtube.videos[0].id], items: [item("a1")] },
      { id: "b", title: "B", videoIds: [youtube.videos[3].id], items: [item("b1")] },
    ]);
    await openAlbum(user, "A");
    await user.click(within(body()).getByRole("button", { name: ui.watchVideo }));
    const youtubeWin = screen.getByLabelText(youtube.ui.title, { selector: "section" });
    expect(youtubeWin.querySelector("iframe")?.getAttribute("src")).toContain(youtube.videos[0].id);
    await user.dblClick(icon(photos.title));
    await user.click(within(body()).getByRole("button", { name: ui.backToGrid }));
    await user.click(within(body()).getByRole("button", { name: ui.back }));
    await user.click(tile("B"));
    await user.click(thumb("Fixture b1"));
    await user.click(within(body()).getByRole("button", { name: ui.watchVideo }));
    expect(youtubeWin.querySelector("iframe")?.getAttribute("src")).toContain(youtube.videos[3].id);
  });
});

describe("Photos on a phone", () => {
  it("phone.css has no Photos selector left in its grouped-list rules", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/phone.css"), "utf8");
    expect(css).not.toContain("photo-albums");
    expect(css).not.toMatch(/data-win="photos"\]\s*\.folder-grid/);
  });
});
