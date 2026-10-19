// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";
import { IconButton } from "@/components/desktop/IconButton";

function setup() {
  const onOpen = vi.fn();
  render(
    <Desktop windows={{}}>
      <IconButton icon="folder" label="Test folder" onOpen={onOpen} />
    </Desktop>,
  );
  return {
    onOpen,
    user: userEvent.setup(),
    btn: () => screen.getByRole("button", { name: "Test folder" }),
  };
}

describe("IconButton", () => {
  afterEach(() => vi.restoreAllMocks());

  it("a single click selects without opening on desktop", async () => {
    const { user, onOpen, btn } = setup();
    await user.click(btn());
    expect(btn()).toHaveClass("selected");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("double-click opens", async () => {
    const { user, onOpen, btn } = setup();
    await user.dblClick(btn());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("Enter opens", async () => {
    const { user, onOpen, btn } = setup();
    btn().focus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("one tap opens in phone mode", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    const { user, onOpen, btn } = setup();
    await user.click(btn());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
