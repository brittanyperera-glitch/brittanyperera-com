// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CvDocument } from "@/components/cv/CvDocument";
import { cv } from "@/content/cv";

describe("CvDocument", () => {
  it.each([
    ["the CV window", 3 as const, false],
    ["/cv", 1 as const, true],
  ])("%s shows the headline, profile, places and header links", (_name, level, standalone) => {
    const { container } = render(<CvDocument headingLevel={level} standalone={standalone} />);
    const text = container.textContent ?? "";
    expect(text).toContain(cv.headline);
    expect(text).toContain(cv.profile);
    for (const r of cv.roles) if (r.place) expect(text).toContain(r.place);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute("href", cv.linkedin);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", cv.github);
    expect(screen.getByRole("link", { name: cv.email })).toHaveAttribute(
      "href",
      `mailto:${cv.email}`,
    );
    for (const [label] of cv.skills) expect(text).toContain(label);
  });

  it("offers the PDF and a way back to the desktop on /cv only", () => {
    const { unmount } = render(<CvDocument headingLevel={1} standalone />);
    expect(screen.getByRole("link", { name: cv.downloadLabel })).toHaveAttribute(
      "href",
      "/Brittany-Perera-CV.pdf",
    );
    expect(screen.getByRole("link", { name: cv.backLabel })).toHaveAttribute("href", "/");
    unmount();
    render(<CvDocument headingLevel={3} />);
    expect(screen.queryByRole("link", { name: cv.backLabel })).toBeNull();
    expect(screen.queryByRole("link", { name: cv.downloadLabel })).toBeNull();
  });
});
