// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CvBuilderWindow } from "@/components/apps/CvBuilderWindow";
import { Desktop, useDesktop } from "@/components/desktop/Desktop";
import { cvBuilder } from "@/content/cvbuilder";
import { createGame, type Game, gravityMs, type Kind, type Piece } from "@/lib/tetris";
import type { WinId } from "@/lib/types";

const TOTAL = cvBuilder.entries.length;

/** O piece at the top left; the bottom row is full except the two columns the O will fill. */
function nearLine(lines = 0): () => Game {
  return () => {
    const g = createGame(1, cvBuilder.pieceLabels, TOTAL);
    for (let c = 2; c < 10; c++) g.board[15][c] = "I" as Kind;
    return { ...g, lines, piece: { ...(g.piece as Piece), kind: "O", rot: 0, x: 0, y: 0 } };
  };
}

/** Everything below the spawn rows is solid, so the first piece locks and the next cannot spawn. */
function almostTopOut(): Game {
  const g = createGame(1, cvBuilder.pieceLabels, TOTAL);
  for (let r = 2; r < 16; r++) for (let c = 1; c < 10; c++) g.board[r][c] = "I" as Kind;
  return { ...g, piece: { ...(g.piece as Piece), kind: "O", rot: 0, x: 4, y: 0 } };
}

function Open({ ids }: { ids: WinId[] }) {
  const { open } = useDesktop();
  useEffect(() => {
    for (const id of ids) open(id);
  }, [ids, open]);
  return null;
}

const CV_ONLY: WinId[] = ["cvbuilder"];
const CV_THEN_PROJECTS: WinId[] = ["cvbuilder", "projects"];

function setup(startGame?: () => Game, ids: WinId[] = CV_ONLY) {
  render(
    <Desktop windows={{ cvbuilder: <CvBuilderWindow startGame={startGame} /> }}>
      <Open ids={ids} />
    </Desktop>,
  );
}

const press = (key: string) => fireEvent.keyDown(document, { key });
const board = () => document.querySelector("[data-piece-y]") as HTMLElement;
const panel = () => document.querySelector(".cvb-doc") as HTMLElement;
const filed = () => within(panel()).queryAllByRole("listitem");

function usePhone() {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CV Builder content", () => {
  it("has one panel entry and one piece label per timeline entry, in order", () => {
    expect(cvBuilder.entries).toEqual([
      { when: "2018", label: "playground" },
      { when: "2020–24", label: "Oxford" },
      { when: "2023–24", label: "F1" },
      { when: "2025", label: "jet engines" },
      { when: "Now", label: "PangeAI" },
    ]);
    expect(cvBuilder.pieceLabels.slice(0, TOTAL)).toEqual(cvBuilder.entries.map((e) => e.label));
    expect(cvBuilder.pieceLabels.length).toBeGreaterThan(TOTAL);
  });
});

describe("CV Builder window", () => {
  it("clearing a line files the first CV entry into the panel", () => {
    setup(nearLine());
    expect(filed()).toHaveLength(0);
    press(" ");
    const rows = filed();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent(cvBuilder.entries[0].when);
    expect(rows[0]).toHaveTextContent(cvBuilder.entries[0].label);
    expect(rows[0]).not.toHaveTextContent(cvBuilder.entries[1].label);
  });

  it("filing the last entry shows the win alert, whose button downloads the CV", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    setup(nearLine(TOTAL - 1));
    press(" ");
    const alert = screen.getByRole("alertdialog");
    expect(alert).toHaveTextContent(cvBuilder.win.text);
    expect(click).not.toHaveBeenCalled();
    fireEvent.click(within(alert).getByRole("button", { name: cvBuilder.win.button }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("topping out shows the lose alert, and its button restarts the game", () => {
    setup(almostTopOut);
    press(" ");
    const alert = screen.getByRole("alertdialog");
    expect(alert).toHaveTextContent(cvBuilder.lose.text);
    fireEvent.click(within(alert).getByRole("button", { name: cvBuilder.lose.button }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(board().dataset.pieceY).toBe("0");
    expect(screen.queryByRole("button", { name: cvBuilder.again })).toBeNull();
    press("ArrowLeft");
    expect(Number(board().dataset.pieceX)).toBeLessThan(4);
  });

  it("offers a play-again button in the window when an alert was dismissed", () => {
    setup(almostTopOut);
    press(" ");
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: cvBuilder.again }));
    expect(board().dataset.pieceY).toBe("0");
  });

  it("moves, turns and soft drops with the arrow keys", () => {
    setup(nearLine());
    const x = Number(board().dataset.pieceX);
    press("ArrowRight");
    expect(Number(board().dataset.pieceX)).toBe(x + 1);
    press("ArrowLeft");
    expect(Number(board().dataset.pieceX)).toBe(x);
    press("ArrowDown");
    expect(board().dataset.pieceY).toBe("1");
    press("ArrowUp");
    expect(board().dataset.pieceRot).toBe("1");
  });

  it("keys do nothing while another window is in front", () => {
    setup(nearLine(), CV_THEN_PROJECTS);
    expect(document.querySelector("section[data-win=projects]")).toHaveClass("front");
    press("ArrowDown");
    press(" ");
    expect(board().dataset.pieceY).toBe("0");
    expect(filed()).toHaveLength(0);
    fireEvent.pointerDown(document.querySelector("section[data-win=cvbuilder]") as HTMLElement);
    press(" ");
    expect(filed()).toHaveLength(1);
  });

  it("keys do nothing once the window is closed", () => {
    setup(nearLine());
    fireEvent.click(
      within(document.querySelector("section[data-win=cvbuilder]") as HTMLElement).getByRole(
        "button",
        { name: /close/i },
      ),
    );
    press(" ");
    expect(document.querySelector("section[data-win=cvbuilder]")).toHaveAttribute("hidden");
    expect(document.querySelector(".cvb-doc")).toBeNull();
  });

  it("falls by gravity while in front", () => {
    vi.useFakeTimers();
    setup(nearLine());
    act(() => {
      vi.advanceTimersByTime(gravityMs(0) * 2 + 10);
    });
    expect(board().dataset.pieceY).toBe("2");
  });

  it("pauses while another window is in front, and resumes when it is raised", () => {
    vi.useFakeTimers();
    setup(nearLine(), CV_THEN_PROJECTS);
    act(() => {
      vi.advanceTimersByTime(gravityMs(0) * 3);
    });
    expect(board().dataset.pieceY).toBe("0");
    fireEvent.pointerDown(document.querySelector("section[data-win=cvbuilder]") as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(gravityMs(0) + 10);
    });
    expect(board().dataset.pieceY).toBe("1");
  });

  it("shows no on-screen buttons on a laptop", () => {
    setup(nearLine());
    expect(screen.queryByRole("button", { name: cvBuilder.controls.left.label })).toBeNull();
  });

  it("shows on-screen buttons in phone mode, and they play", () => {
    const restore = usePhone();
    try {
      setup(nearLine());
      const x = Number(board().dataset.pieceX);
      for (const c of Object.values(cvBuilder.controls)) {
        expect(screen.getByRole("button", { name: c.label })).toBeInTheDocument();
      }
      fireEvent.click(screen.getByRole("button", { name: cvBuilder.controls.right.label }));
      expect(Number(board().dataset.pieceX)).toBe(x + 1);
      fireEvent.click(screen.getByRole("button", { name: cvBuilder.controls.down.label }));
      expect(board().dataset.pieceY).toBe("1");
    } finally {
      restore();
    }
  });
});
