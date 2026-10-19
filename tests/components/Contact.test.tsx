// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { contact } from "@/content/contact";
import { copy } from "@/content/copy";

function Opener() {
  const { open } = useDesktop();
  useEffect(() => open("contact"), [open]);
  return null;
}

function winEl(): HTMLElement {
  const el = document.querySelector<HTMLElement>('section[data-win="contact"]');
  if (!el) throw new Error("no contact window");
  return el;
}

// userEvent.setup() installs its own clipboard stub, so tests replace it after calling setup().
function setup() {
  render(
    <Desktop windows={{ contact: <ContactWindow /> }}>
      <Opener />
    </Desktop>,
  );
  return { w: within(winEl()), user: userEvent.setup() };
}

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

describe("ContactWindow", () => {
  const realLinkedin = contact.linkedin;
  afterEach(() => {
    vi.restoreAllMocks();
    contact.linkedin = realLinkedin;
    setClipboard(undefined);
  });

  it("hides LinkedIn when unset and shows email and GitHub", () => {
    contact.linkedin = undefined;
    const { w } = setup();
    expect(w.queryByText(copy.windows.linkedin)).toBeNull();
    expect(w.getByText(contact.email)).toBeInTheDocument();
    expect(w.getByRole("button", { name: copy.windows.github })).toBeInTheDocument();
  });

  it("shows LinkedIn when set", () => {
    contact.linkedin = "https://linkedin.com/in/example";
    const { w } = setup();
    expect(w.getByRole("button", { name: copy.windows.linkedin })).toBeInTheDocument();
  });

  it("Copy email success shows the copied alert", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const { w, user } = setup();
    setClipboard({ writeText });
    await user.click(w.getByRole("button", { name: copy.windows.copyEmail }));
    expect(writeText).toHaveBeenCalledWith(contact.email);
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("copied! go on then");
  });

  it("writeText rejecting shows the failure alert with the email", async () => {
    const { w, user } = setup();
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
    await user.click(w.getByRole("button", { name: copy.windows.copyEmail }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent(copy.alerts.copyEmailFailed);
    expect(dialog).toHaveTextContent(contact.email);
  });

  it("a missing clipboard shows the failure alert", async () => {
    const { w, user } = setup();
    setClipboard(undefined);
    await user.click(w.getByRole("button", { name: copy.windows.copyEmail }));
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(copy.alerts.copyEmailFailed);
  });

  it("OK closes the window", async () => {
    const { w, user } = setup();
    await user.click(w.getByRole("button", { name: copy.chrome.ok }));
    expect(winEl()).toHaveAttribute("hidden");
  });
});
