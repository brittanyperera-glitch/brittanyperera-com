// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "@/components/desktop/Desktop";
import info from "@/content/build-info.json";
import { copy } from "@/content/copy";

afterEach(() => vi.unstubAllEnvs());

async function openAbout() {
  const user = userEvent.setup();
  render(<Desktop windows={{}} />);
  await user.click(screen.getByRole("button", { name: copy.chrome.menuTitles.apple }));
  await user.click(screen.getByRole("button", { name: "About Brittany's Mac" }));
  return await screen.findByRole("alertdialog");
}

describe("About Brittany's Mac, This site section", () => {
  it("shows the stack, rounded test counts and the repo link, and no build line without a sha", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_SHA", "");
    const box = await openAbout();
    const down = (n: number) => `${Math.floor(n / 10) * 10}+`;
    expect(box).toHaveTextContent("Next.js 16, React 19, TypeScript 5");
    expect(box).toHaveTextContent(
      `${down(info.unitTests)} unit tests, ${down(info.e2eTests)} browser tests`,
    );
    const link = screen.getByRole("link", { name: copy.alerts.aboutMac.site.code });
    expect(link).toHaveAttribute("href", copy.alerts.aboutMac.site.repo);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(box).not.toHaveTextContent(/build /);
  });

  it("shows the build line when a sha is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_SHA", "abc1234");
    expect(await openAbout()).toHaveTextContent("build abc1234");
  });
});
