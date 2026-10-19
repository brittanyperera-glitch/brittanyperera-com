// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";
import { IconButton } from "@/components/desktop/IconButton";
import { MAC_ICON_NAMES, MacIcon } from "@/components/icons/MacIcon";
import { copy } from "@/content/copy";
import { music } from "@/content/music";
import { projects } from "@/content/projects";
import type { IconName } from "@/lib/types";

// Every icon a visitor can see in the desktop, the Projects and Music folders, or an alert.
const ALERT_ICONS: IconName[] = ["caution", "note", "bomb", "mac"];
const FOLDER_ICONS: IconName[] = [
  ...copy.desktopIcons.map((i) => i.icon),
  ...projects.map((p) => p.icon),
  ...music.instruments.map((i) => i.icon),
  "garage",
  "folder",
  "globe",
  ...ALERT_ICONS,
];

describe("MacIcon", () => {
  it("draws every icon used on the desktop, in folders and in alerts as SVG art", () => {
    for (const name of FOLDER_ICONS) expect(MAC_ICON_NAMES, name).toContain(name);
  });

  it.each([...new Set(FOLDER_ICONS)])("%s renders a labelled svg with a 32px grid", (name) => {
    const { container } = render(<MacIcon name={name} label={`${name} icon`} />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
    expect(svg).toHaveAttribute("role", "img");
    expect(screen.getByRole("img", { name: `${name} icon` })).toBe(svg);
  });

  it("is decorative when it has no label", () => {
    const { container } = render(<MacIcon name="trash" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("keeps gradient ids unique per instance", () => {
    const { container } = render(
      <>
        <MacIcon name="folder" />
        <MacIcon name="folder" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });

  it("falls back to the pixel bitmap for names without SVG art", () => {
    const { container } = render(<MacIcon name="apple" size={16} label="Apple" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
  });

  it("IconButton shows the 32px art and names the button by its label", () => {
    render(
      <Desktop windows={{}}>
        <IconButton icon="musicfolder" label="Test music" onOpen={() => {}} />
      </Desktop>,
    );
    const btn = screen.getByRole("button", { name: "Test music" });
    const svg = btn.querySelector("svg") as SVGElement;
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
