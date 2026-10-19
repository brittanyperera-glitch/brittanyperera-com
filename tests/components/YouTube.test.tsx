// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appWindows } from "@/components/apps/appWindows";
import { Desktop } from "@/components/desktop/Desktop";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";
import { youtube } from "@/content/youtube";

const TITLES = [
  "the balkans",
  "goodmorningvietnam PG13",
  "Vietnam. Chapter II.",
  "Morocco - Escape2Africa",
];
const IDS = ["JDCQZQQVZA0", "EX8Mz9yqoCw", "cQOQ4suE9Ww", "By-I3JTmVko"];

function setup() {
  render(<Desktop windows={appWindows} />);
  return userEvent.setup();
}

const icon = (name: string) =>
  within(document.querySelector(".icons") as HTMLElement).getByRole("button", { name });
const win = () => screen.getByLabelText(copy.windowTitles.youtube, { selector: "section" });
const body = () => win().querySelector(".body") as HTMLElement;
const playLabel = (title: string) => youtube.ui.playLabel.replace("{title}", title);
const iframes = () => document.querySelectorAll("iframe");

async function openYouTube(user: ReturnType<typeof userEvent.setup>) {
  await user.dblClick(icon(copy.windowTitles.youtube));
}

describe("YouTube content", () => {
  it("holds the channel and the four videos verbatim, in order", () => {
    expect(youtube.channelUrl).toBe("https://www.youtube.com/@brittanyperera9402");
    expect(youtube.channelName).toBe("Brittany Perera");
    expect(youtube.videos.map((v) => v.id)).toEqual(IDS);
    expect(youtube.videos.map((v) => v.title)).toEqual(TITLES);
    expect(contact.youtube).toBe(youtube.channelUrl);
  });
});

describe("YouTube desktop icon", () => {
  it("is always on the desktop and opens the window instead of the channel", async () => {
    const user = setup();
    expect(win()).toHaveAttribute("hidden");
    await user.dblClick(icon("YouTube"));
    expect(win()).not.toHaveAttribute("hidden");
    expect(win()).toHaveAttribute("data-win", "youtube");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("Enter on the focused icon opens the window", async () => {
    const user = setup();
    icon("YouTube").focus();
    await user.keyboard("{Enter}");
    expect(win()).not.toHaveAttribute("hidden");
  });

  it("is in the View menu", async () => {
    const user = setup();
    const view = screen.getByRole("button", { name: "View" });
    await user.click(view);
    const menu = document.getElementById(
      view.getAttribute("aria-controls") as string,
    ) as HTMLElement;
    await user.click(within(menu).getByRole("button", { name: "YouTube" }));
    expect(win()).not.toHaveAttribute("hidden");
  });
});

describe("YouTube window", () => {
  it("lists the four videos with exact titles and mqdefault thumbnails, lazily loaded", async () => {
    const user = setup();
    await openYouTube(user);
    const list = within(body()).getByRole("list", { name: youtube.ui.moreVideos });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    items.forEach((li, i) => {
      expect(li).toHaveTextContent(TITLES[i]);
      const img = li.querySelector("img") as HTMLImageElement;
      expect(img).toHaveAttribute("src", `https://i.ytimg.com/vi/${IDS[i]}/mqdefault.jpg`);
      expect(img).toHaveAttribute("alt", TITLES[i]);
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  it("shows the byline and a text wordmark with no logo image", async () => {
    const user = setup();
    await openYouTube(user);
    expect(body()).toHaveTextContent(`${youtube.ui.by} ${youtube.channelName}`);
    const head = body().querySelector(".yt-head") as HTMLElement;
    expect(head).toHaveTextContent(`${youtube.ui.wordmarkLead}${youtube.ui.wordmarkTail}`);
    expect(head.querySelector("img, svg")).toBeNull();
  });

  it("loads no iframe until play is clicked", async () => {
    const user = setup();
    await openYouTube(user);
    expect(iframes()).toHaveLength(0);
    expect(within(body()).getByRole("button", { name: playLabel(TITLES[0]) })).toBeInTheDocument();
  });

  it("play renders the privacy-enhanced embed for that video", async () => {
    const user = setup();
    await openYouTube(user);
    await user.click(within(body()).getByRole("button", { name: playLabel(TITLES[0]) }));
    expect(iframes()).toHaveLength(1);
    const frame = iframes()[0];
    expect(frame).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${IDS[0]}?autoplay=1`,
    );
    expect(frame).toHaveAttribute("title", TITLES[0]);
    expect(frame).toHaveAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(frame.hasAttribute("allowfullscreen")).toBe(true);
  });

  it("choosing another video swaps the facade and removes the old iframe", async () => {
    const user = setup();
    await openYouTube(user);
    await user.click(within(body()).getByRole("button", { name: playLabel(TITLES[0]) }));
    expect(iframes()).toHaveLength(1);
    const list = within(body()).getByRole("list", { name: youtube.ui.moreVideos });
    await user.click(within(list).getByRole("button", { name: TITLES[2] }));
    expect(iframes()).toHaveLength(0);
    expect(within(body()).getByRole("button", { name: playLabel(TITLES[2]) })).toBeInTheDocument();
    expect(within(body()).getByRole("heading", { name: TITLES[2] })).toBeInTheDocument();
    await user.click(within(body()).getByRole("button", { name: playLabel(TITLES[2]) }));
    expect(iframes()[0]).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${IDS[2]}?autoplay=1`,
    );
  });

  it("closing the window removes the iframe, and reopening starts from the facade", async () => {
    const user = setup();
    await openYouTube(user);
    await user.click(within(body()).getByRole("button", { name: playLabel(TITLES[0]) }));
    expect(iframes()).toHaveLength(1);
    await user.click(within(win()).getByRole("button", { name: copy.chrome.close }));
    expect(win()).toHaveAttribute("hidden");
    expect(iframes()).toHaveLength(0);
    await openYouTube(user);
    expect(iframes()).toHaveLength(0);
  });

  it("the channel button goes through the leave alert", async () => {
    const user = setup();
    await openYouTube(user);
    await user.click(within(body()).getByRole("button", { name: youtube.ui.channelLink }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(copy.alerts.leave.text);
  });

  it("invents no view counts, ratings or dates", async () => {
    const user = setup();
    await openYouTube(user);
    const text = body().textContent ?? "";
    expect(text).not.toMatch(/\d{3,}/);
    expect(text).not.toMatch(/\bviews?\b|\bstars?\b|\bratings?\b|\bago\b/i);
  });
});
