// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";
import { SetupFlow } from "@/components/setup/SetupFlow";
import { copy } from "@/content/copy";

const PHONE = "(max-width: 700px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

function mockMedia(matching: string[]) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

const win = (name: string) => screen.getByLabelText(name, { selector: "section" });
const setupDialog = () => screen.queryByRole("dialog", { name: copy.setup.windowTitle });
const bootOverlay = (c: HTMLElement) => c.querySelector(".boot");
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const click = (name: string | RegExp, role: "button" | "radio" = "button") =>
  fireEvent.click(screen.getByRole(role, { name }));

function renderFlow() {
  return render(
    <Desktop windows={{}}>
      <SetupFlow />
    </Desktop>,
  );
}

// Boot 0.9s, then the splash marches for about 2.6s. Separate acts: each phase's timers are only
// scheduled once React has rendered the previous phase.
const throughBoot = () => {
  advance(900);
  advance(2600);
};

function runToConclusion(visitorLabel: RegExp) {
  throughBoot();
  click(/Continue/);
  click(visitorLabel, "radio");
  click(/Continue/);
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("SetupFlow", () => {
  it("starts on the boot overlay", () => {
    const { container } = renderFlow();
    expect(bootOverlay(container)).not.toBeNull();
    expect(setupDialog()).toBeNull();
  });

  it("Escape during boot ends setup and opens About and CV", () => {
    const { container } = renderFlow();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(bootOverlay(container)).toBeNull();
    expect(setupDialog()).toBeNull();
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
    expect(win("Projects")).toHaveAttribute("hidden");
  });

  it("clicking the boot screen skips too", () => {
    const { container } = renderFlow();
    fireEvent.click(bootOverlay(container) as Element);
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
  });

  it("the assistant appears after the splash, with Back disabled on step 1", () => {
    renderFlow();
    throughBoot();
    expect(setupDialog()).not.toBeNull();
    expect(screen.getByRole("button", { name: /Go Back/ })).toBeDisabled();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("three steps as 'I'm hiring' then Go Ahead opens About and CV and stores the choice", () => {
    renderFlow();
    runToConclusion(/I'm hiring/);
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    click(copy.setup.goAhead);
    advance(20000);
    expect(setupDialog()).toBeNull();
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
    expect(JSON.parse(window.localStorage.getItem("bp:setup-done") ?? "null")).toEqual({
      visitor: "recruiter",
    });
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe(
      copy.setup.swatches[0].hex,
    );
  });

  it("never shows a colour picker on any step", () => {
    renderFlow();
    throughBoot();
    for (let i = 0; i < 3; i++) {
      expect(screen.queryByRole("radio", { name: /Tangerine|Blueberry/ })).toBeNull();
      expect(document.querySelector(".swatches, .preview-sel")).toBeNull();
      if (i < 2) click(/Continue/);
    }
  });

  it("step 1 has no speech bubble, steps 2 and 3 do", () => {
    renderFlow();
    throughBoot();
    expect(document.querySelector(".speech")).toBeNull();
    click(/Continue/);
    expect(document.querySelector(".speech")).toHaveTextContent("be honest, who are you?");
    click(/Continue/);
    expect(document.querySelector(".speech")).toHaveTextContent("thats it, promise");
  });

  it("a collaborator gets About and Projects", () => {
    renderFlow();
    runToConclusion(/Let's build something/);
    click(copy.setup.goAhead);
    advance(20000);
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("Projects")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).toHaveAttribute("hidden");
  });

  it("install lines hold 1s each, or 2s under reduced motion", () => {
    const first = copy.setup.installLines[0];
    const second = copy.setup.installLines[1];
    const { unmount } = renderFlow();
    runToConclusion(/I'm hiring/);
    click(copy.setup.goAhead);
    advance(1500);
    expect(screen.getByText(second)).toBeInTheDocument();
    unmount();

    mockMedia([REDUCED]);
    renderFlow();
    runToConclusion(/I'm hiring/);
    click(copy.setup.goAhead);
    advance(1500);
    expect(screen.getByText(first)).toBeInTheDocument();
    expect(screen.queryByText(second)).toBeNull();
    advance(1000);
    expect(screen.getByText(second)).toBeInTheDocument();
  });

  it("reduced motion shows all four greetings at once, each with its lang", () => {
    mockMedia([REDUCED]);
    const { container } = renderFlow();
    throughBoot();
    const spans = container.querySelectorAll(".hello-all [lang]");
    expect(spans).toHaveLength(copy.setup.hello.length);
    copy.setup.hello.forEach((h, i) => {
      expect(spans[i]).toHaveAttribute("lang", h.lang);
      expect(spans[i]).toHaveTextContent(h.text);
    });
  });

  it("the greeting cycles with its lang when motion is allowed", () => {
    const { container } = renderFlow();
    throughBoot();
    const hello = () => container.querySelector(".hello") as HTMLElement;
    expect(hello()).toHaveAttribute("lang", "en");
    advance(1800);
    expect(hello()).toHaveAttribute("lang", copy.setup.hello[1].lang);
  });

  it("with setup already done as a collaborator, setup never shows and About and Projects open", () => {
    window.localStorage.setItem("bp:setup-done", JSON.stringify({ visitor: "collab" }));
    const { container } = renderFlow();
    expect(bootOverlay(container)).toBeNull();
    expect(setupDialog()).toBeNull();
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("Projects")).not.toHaveAttribute("hidden");
  });

  it("ignores a corrupt stored value and runs setup", () => {
    window.localStorage.setItem("bp:setup-done", JSON.stringify({ visitor: "nope" }));
    const { container } = renderFlow();
    expect(bootOverlay(container)).not.toBeNull();
  });

  it("completes with storage throwing on every read and write", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderFlow();
    expect(() => {
      runToConclusion(/I'm hiring/);
      click(copy.setup.goAhead);
      advance(20000);
    }).not.toThrow();
    expect(setupDialog()).toBeNull();
    expect(win("About me")).not.toHaveAttribute("hidden");
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
  });

  it("on a phone, opens only the visitor's most relevant window and shows the laptop alert", () => {
    mockMedia([PHONE]);
    renderFlow();
    runToConclusion(/I'm hiring/);
    click(copy.setup.goAhead);
    advance(20000);
    expect(win("CV.pdf")).not.toHaveAttribute("hidden");
    expect(win("About me")).toHaveAttribute("hidden");
    expect(screen.getByRole("alertdialog")).toHaveTextContent(copy.alerts.phone);
  });

  it("on a phone, a returning visitor gets one window too", () => {
    mockMedia([PHONE]);
    window.localStorage.setItem("bp:setup-done", JSON.stringify({ visitor: "client" }));
    renderFlow();
    expect(win("Say hi")).not.toHaveAttribute("hidden");
    expect(win("About me")).toHaveAttribute("hidden");
  });
});

describe("SetupFlow focus and motion", () => {
  const desktopEl = (c: HTMLElement) => c.querySelector(".desktop") as HTMLElement;

  it("keeps the desktop inert behind the boot screen, focuses its button, and frees it after", () => {
    const { container } = renderFlow();
    expect(desktopEl(container)).toHaveAttribute("inert");
    expect(bootOverlay(container)).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(desktopEl(container)).not.toHaveAttribute("inert");
  });

  it("keeps the desktop inert behind the Setup Assistant", () => {
    const { container } = renderFlow();
    throughBoot();
    expect(setupDialog()).not.toBeNull();
    expect(desktopEl(container)).toHaveAttribute("inert");
  });

  it("Tab wraps inside the assistant in both directions", () => {
    renderFlow();
    throughBoot();
    const dialog = setupDialog() as HTMLElement;
    const next = screen.getByRole("button", { name: /Continue/ });
    expect(next).toHaveFocus();
    fireEvent.keyDown(next, { key: "Tab" });
    expect(screen.getByRole("button", { name: copy.setup.skip })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "Tab", shiftKey: true });
    expect(next).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("Tab with focus outside the assistant pulls it back in", () => {
    renderFlow();
    throughBoot();
    (document.activeElement as HTMLElement).blur();
    fireEvent.keyDown(document.body, { key: "Tab" });
    expect((setupDialog() as HTMLElement).contains(document.activeElement)).toBe(true);
  });

  it("after setup, focus lands on the front window's close box, not <body>", () => {
    renderFlow();
    runToConclusion(/I'm hiring/);
    click(copy.setup.goAhead);
    advance(20000);
    expect(setupDialog()).toBeNull();
    expect(within(win("CV.pdf")).getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("after Esc skips setup, focus lands on a window's close box", () => {
    renderFlow();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toHaveClass("close");
  });

  it("reduced motion reaches the assistant within half a second", () => {
    mockMedia([REDUCED]);
    renderFlow();
    expect(setupDialog()).toBeNull();
    // Two acts, as in throughBoot: the splash timer is only set once the splash has rendered.
    advance(250);
    advance(250);
    expect(setupDialog()).not.toBeNull();
  });

  it("motion allowed still takes the full boot and splash", () => {
    renderFlow();
    advance(500);
    expect(setupDialog()).toBeNull();
  });
});
