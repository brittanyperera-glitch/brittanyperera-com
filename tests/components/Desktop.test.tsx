// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";

function setup() {
  render(<Desktop windows={{}} />);
  return userEvent.setup();
}

// Closed windows are `hidden`, which removes their accessible name, so find them by aria-label.
const win = (name: string) => screen.getByLabelText(name, { selector: "section" });

describe("desktop shell", () => {
  it("Enter on the focused CV icon opens the CV window", async () => {
    const user = setup();
    expect(win("CV.pdf")).toHaveAttribute("hidden");
    await user.tab();
    screen.getByRole("button", { name: "CV" }).focus();
    await user.keyboard("{Enter}");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
  });

  it("File > Open CV makes CV the front window", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "About me" }));
    await user.dblClick(screen.getByRole("button", { name: "About me" }));
    expect(win("About me")).toHaveClass("front");
    await user.click(screen.getByRole("button", { name: "File" }));
    await user.click(screen.getByRole("button", { name: "Open CV" }));
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).toHaveClass("front");
    expect(win("About me")).not.toHaveClass("front");
  });

  it("Special > Break something shows the system error alert", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Break something" }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(
      "Sorry, a system error occurred.",
    );
  });

  it("Special > Empty Trash confirms; Keep them closes; Empty Trash shows the follow-up", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Empty Trash…" }));
    const confirm = await screen.findByRole("alertdialog");
    expect(confirm).toHaveTextContent("permanently delete my mistakes");
    await user.click(within(confirm).getByRole("button", { name: "Keep them" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Empty Trash…" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Empty Trash" }),
    );
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(
      "nice try. theyre load bearing",
    );
  });

  it("has no Guestbook or Delulu button in the icons or any menu", async () => {
    const user = setup();
    const banned = /guestbook|delulu/i;
    expect(screen.queryAllByRole("button", { name: banned, hidden: true })).toHaveLength(0);
    for (const name of ["Brittany", "File", "View", "Special"]) {
      await user.click(screen.getByRole("button", { name }));
      expect(screen.queryAllByRole("button", { name: banned, hidden: true })).toHaveLength(0);
    }
    await user.click(screen.getByRole("button", { name: "Apple menu" }));
    expect(screen.queryAllByRole("button", { name: banned, hidden: true })).toHaveLength(0);
  });

  it("Escape with a menu open closes the menu", async () => {
    const user = setup();
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    expect(file).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Open CV" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(file).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Open CV" })).toBeNull();
  });

  it("Escape with an alert open closes only the alert, not the menu state behind it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Break something" }));
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("closing a window via its Close button hides it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "File" }));
    await user.click(screen.getByRole("button", { name: "Open CV" }));
    const cv = win("CV.pdf");
    expect(cv).not.toHaveAttribute("hidden");
    await user.click(within(cv).getByRole("button", { name: "Close" }));
    expect(cv).toHaveAttribute("hidden");
  });

  it("renders a window for every project, titled from the project", () => {
    setup();
    expect(win("Trip Planner")).toHaveAttribute("hidden");
    expect(win("100 Days of Delulu")).toHaveAttribute("hidden");
  });
});
