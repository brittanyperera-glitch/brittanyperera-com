// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appWindows } from "@/components/apps/appWindows";
import { TruthsWindow } from "@/components/apps/TruthsWindow";
import { Desktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { truths } from "@/content/truths";
import type { Visitor } from "@/lib/types";

const round = (i: number) => truths.rounds[i];
const lieOf = (i: number) => round(i).statements.find((s) => s.lie)?.text ?? "";
const truthOf = (i: number) => round(i).statements.find((s) => !s.lie)?.text ?? "";
const pick = (text: string) => screen.getByRole("button", { name: new RegExp(text) });

function setup() {
  render(<TruthsWindow />);
  return userEvent.setup();
}

describe("TruthsWindow", () => {
  it("opens on round 1 with three statements to pick from", () => {
    setup();
    expect(screen.getByText(truths.intro)).toBeInTheDocument();
    expect(screen.getByText(round(0).label)).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: round(0).label }).querySelectorAll("button"),
    ).toHaveLength(3);
    expect(screen.queryByText(truths.right)).toBeNull();
  });

  it("says got it when the lie is picked", async () => {
    const user = setup();
    await user.click(pick(lieOf(0)));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(truths.right);
    expect(status).toHaveTextContent(truths.others);
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("says nope when a truth is picked and marks the lie", async () => {
    const user = setup();
    await user.click(pick(truthOf(0)));
    expect(screen.getByRole("status")).toHaveTextContent(truths.wrong);
    expect(within(pick(lieOf(0))).getByText(truths.lieTag)).toBeInTheDocument();
  });

  it("keeps the first pick", async () => {
    const user = setup();
    await user.click(pick(truthOf(0)));
    await user.click(pick(lieOf(0)));
    expect(screen.getByRole("status")).toHaveTextContent(truths.wrong);
  });

  it("Next round shows round 2, and Play again resets to round 1", async () => {
    const user = setup();
    expect(screen.queryByRole("button", { name: truths.next })).toBeNull();
    await user.click(pick(lieOf(0)));
    await user.click(screen.getByRole("button", { name: truths.next }));
    expect(screen.getByText(round(1).label)).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
    await user.click(pick(truthOf(1)));
    expect(screen.queryByRole("button", { name: truths.next })).toBeNull();
    await user.click(screen.getByRole("button", { name: truths.again }));
    expect(screen.getByText(round(0).label)).toBeInTheDocument();
    expect(screen.queryByText(truths.wrong)).toBeNull();
  });

  it("is keyboard usable: Enter on a focused statement picks it", async () => {
    const user = setup();
    pick(lieOf(0)).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(truths.right);
  });
});

describe("Two Truths on the desktop", () => {
  it("is never a first window for any visitor", () => {
    for (const v of Object.keys(copy.firstWindows) as Visitor[])
      expect(copy.firstWindows[v]).not.toContain("truths");
  });

  it("is reachable from its desktop icon, after the CV icon", async () => {
    render(<Desktop windows={appWindows} />);
    const win = () => screen.getByLabelText(copy.windowTitles.truths, { selector: "section" });
    expect(win()).toHaveAttribute("hidden");
    const icons = document.querySelector(".icons") as HTMLElement;
    expect(copy.desktopIcons.findIndex((i) => i.open === "truths")).toBeGreaterThan(0);
    await userEvent.setup().dblClick(within(icons).getByRole("button", { name: truths.title }));
    expect(win()).not.toHaveAttribute("hidden");
    expect(win()).toHaveAttribute("data-win", "truths");
  });
});
