// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PhotosWindow } from "@/components/apps/PhotosWindow";
import { YouTubeWindow } from "@/components/apps/YouTubeWindow";
import { Desktop } from "@/components/desktop/Desktop";
import { type PhotoItem, photos } from "@/content/photos";

const item = (name: string, caption = `caption ${name}`) => ({
  src: `/photos/${name}.jpg`,
  alt: `Fixture ${name}`,
  caption,
});

const fixtures: PhotoItem[] = [item("alpha"), item("beta"), item("gamma")];

const ui = photos.ui;
const counter = (n: number, total: number) =>
  ui.counter.replace("{n}", String(n)).replace("{total}", String(total));

function setup(items: PhotoItem[] = fixtures) {
  render(
    <Desktop windows={{ photos: <PhotosWindow items={items} />, youtube: <YouTubeWindow /> }} />,
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

const thumb = (alt: string) => within(body()).getByRole("button", { name: alt });

// The grid, then the first photo.
async function openViewer(user: User) {
  await openPhotos(user);
  await user.click(within(body()).getAllByRole("button", { name: /^Fixture / })[0]);
}

const slider = () => within(body()).getByRole("slider");

describe("Photos library", () => {
  it("opens straight on the grid, not a viewer", async () => {
    const user = setup();
    await openPhotos(user);
    for (const i of fixtures) expect(thumb(i.alt)).toBeInTheDocument();
    expect(within(body()).queryByRole("slider")).toBeNull();
  });

  it("shows every item as one thumbnail with its alt, sized, lazy after the first row", async () => {
    const many = Array.from({ length: 5 }, (_, i) => item(`g${i}`));
    const user = setup(many);
    await openPhotos(user);
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

  it("counts the photos in a footer under the grid", async () => {
    const user = setup();
    await openPhotos(user);
    expect(within(body()).getByText(ui.countMany.replace("{n}", "3"))).toBeInTheDocument();
  });

  it("uses the singular footer for one photo", async () => {
    const user = setup([item("solo")]);
    await openPhotos(user);
    expect(within(body()).getByText(ui.countOne)).toBeInTheDocument();
  });

  it("renders no album or country text with the real content", async () => {
    render(<Desktop windows={{ photos: <PhotosWindow /> }} />);
    await userEvent.setup().dblClick(icon(photos.title));
    const text = body().textContent ?? "";
    expect(text).not.toMatch(/All albums|Indonesia|Singapore|Turkey|Laos|Kenya/);
    expect(body().querySelectorAll(".photo-thumb")).toHaveLength(photos.items.length);
  });

  it("holds only its title with no photos", async () => {
    const user = setup([]);
    await openPhotos(user);
    expect(body().textContent).toBe(photos.title);
    expect(within(body()).queryAllByRole("button")).toHaveLength(0);
  });

  it("clicking thumbnail N opens the viewer at N", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(thumb("Fixture beta"));
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption beta")).toBeInTheDocument();
  });

  it("Enter on a focused thumbnail opens it", async () => {
    const user = setup();
    await openPhotos(user);
    thumb("Fixture gamma").focus();
    await user.keyboard("{Enter}");
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
  });

  it("viewer back returns to the grid and focuses thumbnail N", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(thumb("Fixture beta"));
    await user.click(within(body()).getByRole("button", { name: ui.backToGrid }));
    expect(document.activeElement).toBe(thumb("Fixture beta"));
    await user.click(thumb("Fixture gamma"));
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(thumb("Fixture gamma"));
  });

  it("shows a caption for a captioned item and no caption element for an uncaptioned one", async () => {
    const user = setup([item("cap"), item("bare", "")]);
    await openPhotos(user);
    await user.click(thumb("Fixture cap"));
    expect(body().querySelector(".photo-caption")).toHaveTextContent("caption cap");
    await user.click(within(body()).getByRole("button", { name: ui.next }));
    expect(within(body()).getByText(counter(2, 2))).toBeInTheDocument();
    expect(body().querySelector(".photo-caption")).toBeNull();
  });
});

describe("Photos viewer", () => {
  it("shows one photo per page, the caption under it", async () => {
    const user = setup();
    await openViewer(user);
    expect(body().querySelectorAll("img")).toHaveLength(1);
    const stage = body().querySelector(".photo-stage") as HTMLElement;
    const caption = within(body()).getByText("caption alpha");
    expect(stage.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("Next and Previous wrap around and move the counter", async () => {
    const user = setup();
    await openViewer(user);
    await user.click(within(body()).getByRole("button", { name: ui.prev }));
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption gamma")).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: ui.next }));
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption alpha")).toBeInTheDocument();
  });

  it("has a range input as the scroll bar, in step with the page", async () => {
    const user = setup();
    await openViewer(user);
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
    await openViewer(user);
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
  });

  it("arrow keys do nothing once another window is in front", async () => {
    const user = setup();
    await openViewer(user);
    await user.dblClick(icon("YouTube"));
    expect(win()).not.toHaveClass("front");
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
  });

  it("leaves arrow keys to the scroll bar when it has focus, so a press moves one page", async () => {
    const user = setup();
    await openViewer(user);
    slider().focus();
    fireEvent.keyDown(slider(), { key: "ArrowRight", bubbles: true });
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
  });

  it("Back and Escape both return from a photo to the grid", async () => {
    const user = setup();
    await openViewer(user);
    await user.click(within(body()).getByRole("button", { name: ui.backToGrid }));
    expect(thumb("Fixture beta")).toBeInTheDocument();
    await user.click(thumb("Fixture beta"));
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(within(body()).queryByText("caption beta")).toBeNull();
    expect(thumb("Fixture gamma")).toBeInTheDocument();
  });

  it("arrow keys in the grid do not turn pages", async () => {
    const user = setup();
    await openPhotos(user);
    await user.keyboard("{ArrowRight}");
    expect(within(body()).queryByRole("slider")).toBeNull();
  });

  it("opening a photo puts focus on the viewer's first button, not the page body", async () => {
    const user = setup();
    await openViewer(user);
    expect(document.activeElement).toBe(
      within(body()).getByRole("button", { name: ui.backToGrid }),
    );
  });

  it("one Escape closes an open menu and leaves the photo where it is", async () => {
    const user = setup();
    await openViewer(user);
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    expect(file).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(file).toHaveAttribute("aria-expanded", "false");
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(thumb("Fixture alpha")).toBeInTheDocument();
  });
});

describe("Photo thumbnails", () => {
  // jsdom draws no CSS, so pin the rule that makes tiles square at every width: the 240px height
  // attribute on the img beats aspect-ratio unless the stylesheet sets height: auto.
  it("the thumbnail rule is square: width 100%, height auto, aspect-ratio 1", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/photos.css"), "utf8");
    const rule = css.match(/\.photo-thumb img\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/height:\s*auto/);
    expect(rule).toMatch(/aspect-ratio:\s*1\b/);
  });
});
