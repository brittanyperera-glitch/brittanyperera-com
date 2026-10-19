// @vitest-environment jsdom
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

// General is deliberately NOT first here: the window must put it first itself.
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

async function openAlbum(user: User, title: string) {
  await openPhotos(user);
  await user.dblClick(within(body()).getByRole("button", { name: title }));
}

const slider = () => within(body()).getByRole("slider");

describe("Photos content", () => {
  it("lists the General album first", () => {
    expect(photos.albums[0].id).toBe("general");
    expect(photos.albums[0].title).toBe("General");
  });
});

describe("Photos album list", () => {
  it("shows one folder per album that has items, General first, in a Finder-style grid", async () => {
    const user = setup();
    await openPhotos(user);
    const folders = within(body()).getAllByRole("button");
    expect(folders.map((b) => b.textContent)).toEqual(["General", "Vietnam", "Morocco"]);
    expect(body().querySelector(".folder-grid")).not.toBeNull();
    expect(within(body()).queryByRole("button", { name: "Empty album" })).toBeNull();
    expect(body().querySelector("img")).toBeNull();
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
    expect(within(body()).queryByRole("button", { name: "Vietnam" })).toBeNull();
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

  it("Back and Escape return to the album list, and General is first again", async () => {
    const user = setup();
    await openAlbum(user, "General");
    await user.click(within(body()).getByRole("button", { name: ui.back }));
    expect(within(body()).getByRole("button", { name: "Morocco" })).toBeInTheDocument();
    await user.dblClick(within(body()).getByRole("button", { name: "Morocco" }));
    expect(within(body()).getByText(counter(1, 2))).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(within(body()).queryByText("caption m1")).toBeNull();
    expect(within(body()).getByRole("button", { name: "General" })).toBeInTheDocument();
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
    await user.click(within(body()).getByRole("button", { name: ui.back }));
    await user.dblClick(within(body()).getByRole("button", { name: "B" }));
    await user.click(within(body()).getByRole("button", { name: ui.watchVideo }));
    expect(youtubeWin.querySelector("iframe")?.getAttribute("src")).toContain(youtube.videos[3].id);
  });
});
