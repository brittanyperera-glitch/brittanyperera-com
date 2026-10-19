// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PhotosWindow } from "@/components/apps/PhotosWindow";
import { Desktop } from "@/components/desktop/Desktop";
import { photos } from "@/content/photos";

const fixtures = [
  { src: "/photos/a.jpg", alt: "Fixture alpha", caption: "caption alpha" },
  { src: "/photos/b.jpg", alt: "Fixture beta", caption: "caption beta" },
  { src: "/photos/c.jpg", alt: "Fixture gamma", caption: "caption gamma" },
];

const counter = (n: number, total: number) =>
  photos.counter.replace("{n}", String(n)).replace("{total}", String(total));

function setup(items = fixtures) {
  render(<Desktop windows={{ photos: <PhotosWindow items={items} /> }} />);
  return userEvent.setup();
}

const win = () => screen.getByLabelText(photos.title, { selector: "section" });
const body = () => win().querySelector(".body") as HTMLElement;
const icon = (name: string) =>
  within(document.querySelector(".icons") as HTMLElement).getByRole("button", { name });

async function openPhotos(user: ReturnType<typeof userEvent.setup>) {
  await user.dblClick(icon(photos.title));
}

describe("Photos app", () => {
  it("shows one thumbnail button per item, named by its alt, as lazy plain images", async () => {
    const user = setup();
    await openPhotos(user);
    for (const item of fixtures) {
      const btn = within(body()).getByRole("button", { name: item.alt });
      const img = btn.querySelector("img") as HTMLImageElement;
      expect(img).toHaveAttribute("src", item.src);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
    }
  });

  it("opens a photo large with its caption and counter from content", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(within(body()).getByRole("button", { name: "Fixture beta" }));
    expect(within(body()).getByRole("img", { name: "Fixture beta" })).toHaveAttribute(
      "src",
      "/photos/b.jpg",
    );
    expect(within(body()).getByText("caption beta")).toBeInTheDocument();
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    expect(within(body()).queryByRole("button", { name: "Fixture alpha" })).toBeNull();
  });

  it("Next and Previous wrap around", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(within(body()).getByRole("button", { name: "Fixture gamma" }));
    await user.click(within(body()).getByRole("button", { name: photos.next }));
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption alpha")).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: photos.prev }));
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
    expect(within(body()).getByText("caption gamma")).toBeInTheDocument();
  });

  it("arrow keys step through photos while the window is front", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(within(body()).getByRole("button", { name: "Fixture alpha" }));
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(2, 3))).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(within(body()).getByText(counter(3, 3))).toBeInTheDocument();
  });

  it("arrow keys do nothing once another window is in front", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(within(body()).getByRole("button", { name: "Fixture alpha" }));
    await user.dblClick(icon("CV"));
    expect(win()).not.toHaveClass("front");
    await user.keyboard("{ArrowRight}");
    expect(within(body()).getByText(counter(1, 3))).toBeInTheDocument();
  });

  it("Escape returns from the large view to the grid", async () => {
    const user = setup();
    await openPhotos(user);
    await user.click(within(body()).getByRole("button", { name: "Fixture beta" }));
    await user.keyboard("{Escape}");
    for (const item of fixtures) {
      expect(within(body()).getByRole("button", { name: item.alt })).toBeInTheDocument();
    }
    expect(within(body()).queryByText("caption beta")).toBeNull();
  });

  it("renders no grid and no controls with no items", async () => {
    const user = setup([]);
    await openPhotos(user);
    expect(body().querySelector("img")).toBeNull();
    expect(within(body()).queryAllByRole("button")).toHaveLength(0);
    expect(within(body()).queryByRole("list")).toBeNull();
  });
});
