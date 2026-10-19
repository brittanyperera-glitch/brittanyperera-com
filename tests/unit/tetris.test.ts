import { describe, expect, it } from "vitest";
import {
  type Board,
  COLS,
  clearLines,
  collides,
  createGame,
  emptyBoard,
  type Game,
  gravityMs,
  hardDrop,
  KINDS,
  moveH,
  type Piece,
  pieceCells,
  ROWS,
  rotate,
  softDrop,
  tick,
} from "@/lib/tetris";

const LABELS = ["a", "b", "c"];

function withPiece(g: Game, patch: Partial<Piece>): Game {
  return { ...g, piece: { ...(g.piece as Piece), ...patch } };
}

function fullRow(board: Board, row: number, gaps: number[] = []): void {
  for (let c = 0; c < COLS; c++) board[row][c] = gaps.includes(c) ? null : "I";
}

describe("board and pieces", () => {
  it("is 10 wide and 16 tall", () => {
    const b = emptyBoard();
    expect(COLS).toBe(10);
    expect(ROWS).toBe(16);
    expect(b).toHaveLength(16);
    expect(b.every((r) => r.length === 10 && r.every((c) => c === null))).toBe(true);
  });

  it("has the 7 standard tetrominoes, 4 cells in every rotation", () => {
    expect([...KINDS].sort()).toEqual(["I", "J", "L", "O", "S", "T", "Z"]);
    for (const kind of KINDS) {
      for (let rot = 0; rot < 4; rot++) {
        const cells = pieceCells({ kind, rot, x: 0, y: 0 });
        expect(new Set(cells.map(([c, r]) => `${c},${r}`)).size, `${kind}${rot}`).toBe(4);
      }
    }
  });

  it("rotates the I piece from horizontal to vertical", () => {
    const flat = pieceCells({ kind: "I", rot: 0, x: 0, y: 0 });
    const tall = pieceCells({ kind: "I", rot: 1, x: 0, y: 0 });
    expect(new Set(flat.map(([, r]) => r)).size).toBe(1);
    expect(new Set(tall.map(([c]) => c)).size).toBe(1);
  });

  it("detects walls, floor and occupied cells", () => {
    const b = emptyBoard();
    expect(collides(b, { kind: "O", rot: 0, x: 4, y: 0 })).toBe(false);
    expect(collides(b, { kind: "O", rot: 0, x: -1, y: 0 })).toBe(true);
    expect(collides(b, { kind: "O", rot: 0, x: 9, y: 0 })).toBe(true);
    expect(collides(b, { kind: "O", rot: 0, x: 4, y: 15 })).toBe(true);
    b[1][4] = "T";
    expect(collides(b, { kind: "O", rot: 0, x: 4, y: 0 })).toBe(true);
  });
});

describe("random bag", () => {
  it("is deterministic for a seed and differs between seeds", () => {
    const seq = (seed: number) => {
      let g = createGame(seed, LABELS, 5);
      const kinds: string[] = [];
      for (let i = 0; i < 14; i++) {
        kinds.push((g.piece as Piece).kind);
        g = hardDrop({ ...g, board: emptyBoard() });
      }
      return kinds;
    };
    expect(seq(42)).toEqual(seq(42));
    expect(seq(42)).not.toEqual(seq(43));
  });

  it("deals each of the 7 kinds once per bag", () => {
    let g = createGame(7, LABELS, 5);
    const kinds: string[] = [];
    for (let i = 0; i < 14; i++) {
      kinds.push((g.piece as Piece).kind);
      g = hardDrop({ ...g, board: emptyBoard() });
    }
    expect([...kinds.slice(0, 7)].sort()).toEqual([...KINDS].sort());
    expect([...kinds.slice(7, 14)].sort()).toEqual([...KINDS].sort());
  });

  it("gives pieces labels in order, cycling, and previews the next one", () => {
    let g = createGame(1, LABELS, 5);
    expect((g.piece as Piece).label).toBe("a");
    expect(g.next.label).toBe("b");
    g = hardDrop({ ...g, board: emptyBoard() });
    expect((g.piece as Piece).label).toBe("b");
    expect(g.next.label).toBe("c");
    g = hardDrop({ ...g, board: emptyBoard() });
    g = hardDrop({ ...g, board: emptyBoard() });
    expect((g.piece as Piece).label).toBe("a");
  });
});

describe("movement", () => {
  it("moves left and right and stops at the walls", () => {
    let g = withPiece(createGame(1, LABELS, 5), { kind: "O", rot: 0, x: 4, y: 0 });
    g = moveH(g, 1);
    expect((g.piece as Piece).x).toBe(5);
    for (let i = 0; i < 20; i++) g = moveH(g, 1);
    expect((g.piece as Piece).x).toBe(8);
    for (let i = 0; i < 20; i++) g = moveH(g, -1);
    expect((g.piece as Piece).x).toBe(0);
  });

  it("does not move into a locked block", () => {
    const base = createGame(1, LABELS, 5);
    base.board[0][6] = "T";
    base.board[1][6] = "T";
    const g = moveH(withPiece(base, { kind: "O", rot: 0, x: 4, y: 0 }), 1);
    expect((g.piece as Piece).x).toBe(4);
  });

  it("soft drop and gravity move down one row, scoring only for soft drop", () => {
    const g0 = withPiece(createGame(1, LABELS, 5), { kind: "O", rot: 0, x: 4, y: 0 });
    const s = softDrop(g0);
    expect((s.piece as Piece).y).toBe(1);
    expect(s.score).toBe(g0.score + 1);
    const t = tick(g0);
    expect((t.piece as Piece).y).toBe(1);
    expect(t.score).toBe(g0.score);
  });

  it("hard drop lands on the floor and spawns the next piece", () => {
    const g0 = withPiece(createGame(1, LABELS, 5), { kind: "O", rot: 0, x: 0, y: 0 });
    const g = hardDrop(g0);
    expect(g.board[15][0]).toBe("O");
    expect(g.board[15][1]).toBe("O");
    expect(g.board[14][0]).toBe("O");
    expect((g.piece as Piece).label).toBe("b");
    expect((g.piece as Piece).y).toBeLessThanOrEqual(1);
  });

  it("a gravity tick on the floor locks the piece", () => {
    const g0 = withPiece(createGame(1, LABELS, 5), { kind: "O", rot: 0, x: 0, y: 14 });
    const g = tick(g0);
    expect(g.board[15][0]).toBe("O");
    expect((g.piece as Piece).label).toBe("b");
  });
});

describe("rotation", () => {
  it("rotates clockwise through 4 states", () => {
    let g = withPiece(createGame(1, LABELS, 5), { kind: "T", rot: 0, x: 3, y: 4 });
    for (let i = 1; i <= 4; i++) {
      g = rotate(g);
      expect((g.piece as Piece).rot).toBe(i % 4);
    }
  });

  it("kicks one column off the left wall", () => {
    // Upright T flush left; turned over it would poke one column past the wall without a kick.
    const flush = { kind: "T" as const, rot: 1, x: -1, y: 4 };
    expect(collides(createGame(1, LABELS, 5).board, { ...flush, rot: 2 })).toBe(true);
    const g = rotate(withPiece(createGame(1, LABELS, 5), flush));
    expect((g.piece as Piece).rot).toBe(2);
    expect((g.piece as Piece).x).toBe(0);
    expect(collides(g.board, g.piece as Piece)).toBe(false);
  });

  it("kicks one column off the right wall", () => {
    const flush = { kind: "T" as const, rot: 3, x: 8, y: 4 };
    expect(collides(createGame(1, LABELS, 5).board, { ...flush, rot: 0 })).toBe(true);
    const g = rotate(withPiece(createGame(1, LABELS, 5), flush));
    expect((g.piece as Piece).rot).toBe(0);
    expect((g.piece as Piece).x).toBe(7);
    expect(collides(g.board, g.piece as Piece)).toBe(false);
  });

  it("kicks an upright I two columns to lie flat against a wall", () => {
    const g = rotate(withPiece(createGame(1, LABELS, 5), { kind: "I", rot: 1, x: -2, y: 4 }));
    expect((g.piece as Piece).rot).toBe(2);
    expect((g.piece as Piece).x).toBe(0);
    expect(pieceCells(g.piece as Piece).every(([c]) => c >= 0 && c < COLS)).toBe(true);
  });

  it("does not rotate when no kick fits", () => {
    const base = createGame(1, LABELS, 5);
    for (let r = 3; r < 9; r++) fullRow(base.board, r, [4]);
    const g0 = withPiece(base, { kind: "I", rot: 1, x: 2, y: 3 });
    expect(collides(g0.board, g0.piece as Piece)).toBe(false);
    const g = rotate(g0);
    expect((g.piece as Piece).rot).toBe(1);
    expect((g.piece as Piece).x).toBe(2);
  });
});

describe("line clears", () => {
  it("clearLines counts full rows and drops what is above", () => {
    const b = emptyBoard();
    fullRow(b, 15);
    fullRow(b, 14);
    fullRow(b, 13, [0]);
    b[12][3] = "T";
    const { board, cleared } = clearLines(b);
    expect(cleared).toBe(2);
    expect(board[15].filter(Boolean)).toHaveLength(9);
    expect(board[14][3]).toBe("T");
    expect(board).toHaveLength(ROWS);
  });

  it("returns zero when nothing is full", () => {
    const b = emptyBoard();
    fullRow(b, 15, [2]);
    expect(clearLines(b).cleared).toBe(0);
  });

  it("locking a piece that completes a row clears it and counts the line", () => {
    const base = createGame(1, LABELS, 5);
    fullRow(base.board, 15, [0, 1]);
    const g = hardDrop(withPiece(base, { kind: "O", rot: 0, x: 0, y: 0 }));
    expect(g.lines).toBe(1);
    expect(g.board[15][0]).toBe("O");
    expect(g.board[15][5]).toBeNull();
    expect(g.status).toBe("playing");
  });

  it("clears several rows at once", () => {
    const base = createGame(1, LABELS, 9);
    fullRow(base.board, 15, [0, 1]);
    fullRow(base.board, 14, [0, 1]);
    const g = hardDrop(withPiece(base, { kind: "O", rot: 0, x: 0, y: 0 }));
    expect(g.lines).toBe(2);
  });

  it("wins when the line target is reached", () => {
    const base = { ...createGame(1, LABELS, 2), lines: 1 };
    fullRow(base.board, 15, [0, 1]);
    const g = hardDrop(withPiece(base, { kind: "O", rot: 0, x: 0, y: 0 }));
    expect(g.lines).toBe(2);
    expect(g.status).toBe("won");
    expect(g.piece).toBeNull();
  });

  it("ignores input once the game is over", () => {
    const base = { ...createGame(1, LABELS, 1), lines: 0 };
    fullRow(base.board, 15, [0, 1]);
    const won = hardDrop(withPiece(base, { kind: "O", rot: 0, x: 0, y: 0 }));
    expect(won.status).toBe("won");
    expect(moveH(won, 1)).toBe(won);
    expect(tick(won)).toBe(won);
    expect(hardDrop(won)).toBe(won);
    expect(rotate(won)).toBe(won);
    expect(softDrop(won)).toBe(won);
  });
});

describe("top out", () => {
  it("loses when the next piece cannot spawn", () => {
    const base = createGame(1, LABELS, 5);
    for (let r = 2; r < ROWS; r++) fullRow(base.board, r, [0]);
    const g = hardDrop(withPiece(base, { kind: "O", rot: 0, x: 4, y: 0 }));
    expect(g.status).toBe("lost");
    expect(g.piece).toBeNull();
  });

  it("does not lose while there is room to spawn", () => {
    const g = hardDrop(createGame(1, LABELS, 5));
    expect(g.status).toBe("playing");
  });
});

describe("gravity", () => {
  it("is gentle at first and speeds up per line down to a floor", () => {
    expect(gravityMs(0)).toBeGreaterThanOrEqual(700);
    expect(gravityMs(3)).toBeLessThan(gravityMs(0));
    expect(gravityMs(99)).toBeGreaterThanOrEqual(300);
  });
});
