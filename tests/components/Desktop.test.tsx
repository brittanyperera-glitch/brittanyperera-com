// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAlert } from "@/components/alert/AlertProvider";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";

function setup(children?: React.ReactNode) {
  const utils = render(<Desktop windows={{}}>{children}</Desktop>);
  return { user: userEvent.setup(), ...utils };
}

// Closed windows are `hidden`, which removes their accessible name, so find them by aria-label.
const win = (name: string) => screen.getByLabelText(name, { selector: "section" });

describe("desktop shell", () => {
  it("Enter on the focused CV icon opens the CV window", async () => {
    const { user } = setup();
    expect(win("CV.pdf")).toHaveAttribute("hidden");
    await user.tab();
    screen.getByRole("button", { name: "CV" }).focus();
    await user.keyboard("{Enter}");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
  });

  it("File > Open CV makes CV the front window", async () => {
    const { user } = setup();
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
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Break something" }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(
      "Sorry, a system error occurred.",
    );
  });

  it("Special > Empty Trash confirms; Keep them closes; Empty Trash shows the follow-up", async () => {
    const { user } = setup();
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
    const { user } = setup();
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
    const { user } = setup();
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    expect(file).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Open CV" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(file).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Open CV" })).toBeNull();
  });

  it("Escape closes the alert first, then the menu that is still open behind it", async () => {
    // A click outside the open menu now closes it, so the only way to have both open is an alert
    // raised without a pointer press (here a keyboard Enter on a child, as a timed alert would).
    function Trigger() {
      const alert = useAlert();
      return (
        <button type="button" onClick={() => alert({ icon: "note", body: "raised by a child" })}>
          trigger
        </button>
      );
    }
    const { user } = setup(<Trigger />);
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    expect(file).toHaveAttribute("aria-expanded", "true");
    screen.getByRole("button", { name: "trigger" }).focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("alertdialog");
    expect(file).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(file).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(file).toHaveAttribute("aria-expanded", "false");
  });

  it("closing a window via its Close button hides it", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "File" }));
    await user.click(screen.getByRole("button", { name: "Open CV" }));
    const cv = win("CV.pdf");
    expect(cv).not.toHaveAttribute("hidden");
    await user.click(within(cv).getByRole("button", { name: "Close" }));
    expect(cv).toHaveAttribute("hidden");
  });

  it("renders a hidden window for every project, titled from the project", () => {
    setup();
    for (const p of projects) {
      expect(win(p.title)).toHaveAttribute("hidden");
      expect(win(p.title)).toHaveAttribute("data-win", `project:${p.id}`);
    }
  });

  it("gives every window a stable data-win hook", () => {
    setup();
    for (const id of Object.keys(copy.windowTitles)) {
      expect(document.querySelector(`section[data-win="${id}"]`)).not.toBeNull();
    }
  });
});

describe("alert behaviour on the desktop", () => {
  it("makes the desktop inert while an alert is open and restores it after", async () => {
    const { user, container } = setup();
    const root = container.querySelector(".desktop");
    expect(root).not.toHaveAttribute("inert");
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Break something" }));
    await screen.findByRole("alertdialog");
    expect(root).toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(root).not.toHaveAttribute("inert");
  });

  it("gives the alertdialog an accessible name from its text", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Break something" }));
    expect(
      await screen.findByRole("alertdialog", { name: /Sorry, a system error occurred/ }),
    ).toBeVisible();
  });

  it("returns focus to the opener once the desktop is no longer inert", async () => {
    const { user } = setup();
    const sound = screen.getByRole("button", { name: "Sound: off" });
    await user.click(sound);
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Sound: on" })).toHaveFocus();
  });

  it("Enter fires the default button even after focus has moved to the page", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Special" }));
    await user.click(screen.getByRole("button", { name: "Empty Trash…" }));
    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByText(/permanently delete my mistakes/));
    expect(document.body).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

describe("menu behaviour", () => {
  it("Escape from a keyboard-focused menu item puts focus on the menu title", async () => {
    const { user } = setup();
    const special = screen.getByRole("button", { name: "Special" });
    await user.click(special);
    await user.tab();
    expect(screen.getByRole("button", { name: "Empty Trash…" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(special).toHaveAttribute("aria-expanded", "false");
    expect(special).toHaveFocus();
  });

  it("a click outside the open menu, on the sound button or clock, closes it", async () => {
    const { user, container } = setup();
    const file = screen.getByRole("button", { name: "File" });
    await user.click(file);
    await user.click(container.querySelector(".clock") as HTMLElement);
    expect(file).toHaveAttribute("aria-expanded", "false");
    await user.click(file);
    await user.click(screen.getByRole("button", { name: "Sound: off" }));
    expect(file).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking another menu title while one is open switches menus", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "File" }));
    await user.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByRole("button", { name: "File" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "View" })).toHaveAttribute("aria-expanded", "true");
  });

  it("titles use aria-expanded and aria-controls, with no aria-haspopup", async () => {
    const { user } = setup();
    const file = screen.getByRole("button", { name: "File" });
    expect(file).not.toHaveAttribute("aria-haspopup");
    await user.click(file);
    const id = file.getAttribute("aria-controls");
    expect(id).toBeTruthy();
    expect(document.getElementById(id as string)?.tagName).toBe("UL");
  });
});

describe("sound toggle", () => {
  it("with no AudioContext it does not throw, flips the label and shows the alert", async () => {
    expect((window as unknown as { AudioContext?: unknown }).AudioContext).toBeUndefined();
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Sound: off" }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("sound on. sorry in advance");
    expect(screen.getByRole("button", { name: "Sound: on" })).toBeInTheDocument();
  });
});

describe("window drag", () => {
  const dragLeft = async (button: number) => {
    const { user } = setup();
    await user.dblClick(screen.getByRole("button", { name: "About me" }));
    const about = win("About me");
    const bar = about.querySelector(".titlebar") as HTMLElement;
    const before = about.style.left;
    fireEvent.pointerDown(bar, { button, clientX: 10, clientY: 40, pointerId: 1 });
    fireEvent.pointerMove(bar, { button, clientX: 400, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(bar, { button, pointerId: 1 });
    return { before, after: about.style.left };
  };

  it("a primary-button drag moves the window", async () => {
    const { before, after } = await dragLeft(0);
    expect(after).not.toBe(before);
  });

  it("a right-button press on the title bar does not start a drag", async () => {
    const { before, after } = await dragLeft(2);
    expect(after).toBe(before);
  });
});

describe("focus after closing a window", () => {
  it("lands on the desktop icon when no window is left", async () => {
    const { user } = setup();
    screen.getByRole("button", { name: "CV" }).focus();
    await user.keyboard("{Enter}");
    const cv = win("CV.pdf");
    within(cv).getByRole("button", { name: "Close" }).focus();
    await user.keyboard("{Enter}");
    expect(cv).toHaveAttribute("hidden");
    expect(screen.getByRole("button", { name: "CV" })).toHaveFocus();
  });

  it("lands on the new top window's close box when another window is open", async () => {
    const { user } = setup();
    await user.dblClick(screen.getByRole("button", { name: "About me" }));
    await user.dblClick(screen.getByRole("button", { name: "CV" }));
    const cv = win("CV.pdf");
    within(cv).getByRole("button", { name: "Close" }).focus();
    await user.keyboard("{Enter}");
    expect(within(win("About me")).getByRole("button", { name: "Close" })).toHaveFocus();
  });
});

describe("extension seams", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders children inside the alert and desktop context", async () => {
    function Probe() {
      const alert = useAlert();
      const { open } = useDesktop();
      return (
        <button
          type="button"
          onClick={() => {
            open("trash");
            alert({ icon: "note", body: "from a child" });
          }}
        >
          probe
        </button>
      );
    }
    const { user } = setup(<Probe />);
    await user.click(screen.getByRole("button", { name: "probe" }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("from a child");
    expect(win("Trash")).not.toHaveAttribute("hidden");
  });

  it("omits inline left, top and width on windows in phone mode", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    const { user, container } = setup();
    expect(container.querySelector(".desktop")).toHaveAttribute("data-mode", "phone");
    await user.click(screen.getByRole("button", { name: "About me" }));
    const about = win("About me");
    expect(about).not.toHaveAttribute("hidden");
    expect(about.style.left).toBe("");
    expect(about.style.top).toBe("");
    expect(about.style.width).toBe("");
  });

  it("phone title bar labels the close box: Back for a child window, Close otherwise", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    function OpenProject() {
      const { open } = useDesktop();
      return (
        <button type="button" onClick={() => open(`project:${projects[0].id}`)}>
          open project
        </button>
      );
    }
    const { user } = setup(<OpenProject />);
    await user.click(screen.getByRole("button", { name: "About me" }));
    const label = (el: HTMLElement) => {
      const found = el.querySelector(".titlebar .close-label");
      if (!found) throw new Error("no .close-label in the title bar");
      return found.textContent;
    };
    expect(label(win("About me"))).toBe(copy.chrome.closeLabel);
    await user.click(screen.getByRole("button", { name: "File" }));
    await user.click(screen.getByRole("button", { name: "Open CV" }));
    expect(label(win("CV.pdf"))).toBe(copy.chrome.closeLabel);
    await user.click(screen.getByRole("button", { name: "open project" }));
    expect(win(projects[0].title)).not.toHaveAttribute("hidden");
    expect(label(win(projects[0].title))).toBe(copy.chrome.back);
  });

  it("keeps inline left, top and width on desktop", async () => {
    const { user } = setup();
    await user.dblClick(screen.getByRole("button", { name: "About me" }));
    const about = win("About me");
    expect(about.style.width).not.toBe("");
    expect(about.style.left).not.toBe("");
    expect(about.style.top).not.toBe("");
  });
});

describe("copy sourced from content", () => {
  it("default alert button label comes from copy.chrome.ok", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Sound: off" }));
    const dlg = await screen.findByRole("alertdialog");
    expect(within(dlg).getByRole("button", { name: copy.chrome.ok })).toBeInTheDocument();
  });
});
