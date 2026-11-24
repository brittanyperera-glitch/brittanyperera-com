// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

describe("CvDocument header spacing", () => {
  const css = (f: string) => readFileSync(join(process.cwd(), "src/styles", f), "utf8");
  const rule = (sheet: string, selector: string) =>
    sheet.match(new RegExp(`${selector.replace(/[.\\[\]"]/g, "\\$&")}\\s*{([^}]*)}`))?.[1] ?? "";

  it("renders each header link as its own element", () => {
    const { container } = render(<CvDocument headingLevel={3} />);
    expect(container.querySelectorAll(".cv-links > a").length).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ["the /cv page", "cv-print.css", ".cv-links"],
    ["the CV window", "windows.css", ".win .cv-doc .cv-links"],
  ])("%s spaces the header links with a flex gap", (_n, file, selector) => {
    const body = rule(css(file), selector);
    expect(body).toMatch(/display:\s*flex/);
    expect(body).toMatch(/gap:\s*[1-9]/);
  });
});
