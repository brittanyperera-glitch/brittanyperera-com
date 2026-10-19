export const COLS = 10;
export const ROWS = 16;

export const KINDS = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export type Kind = (typeof KINDS)[number];
export type Board = (Kind | null)[][];
export type Status = "playing" | "won" | "lost";

export type Piece = { kind: Kind; rot: number; x: number; y: number; label: string };
export type Queued = { kind: Kind; label: string };

export type Game = {
  board: Board;
  piece: Piece | null;
  next: Queued;
  /** Kinds left in the current shuffled bag. */
  bag: Kind[];
  /** mulberry32 state, advanced whenever a bag is shuffled. */
  seed: number;
  labels: string[];
  /** Pieces created so far (current and next included); picks the next label. */
  spawned: number;
  /** Cleared lines needed to win. */
  total: number;
  lines: number;
  score: number;
  status: Status;
};

// Rotation 0 of each kind as [col, row] in an n x n box.
const BASE: Record<Kind, { n: number; cells: [number, number][] }> = {
  I: {
    n: 4,
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  },
  O: {
    n: 2,
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  T: {
    n: 3,
    cells: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  S: {
    n: 3,
    cells: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
  },
  Z: {
    n: 3,
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  J: {
    n: 3,
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  L: {
    n: 3,
    cells: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
};

/** Clockwise quarter turns, applied to the cells of one kind. */
const SHAPES: Record<Kind, [number, number][][]> = Object.fromEntries(
  KINDS.map((kind) => {
    const { n, cells } = BASE[kind];
    const rots = [cells];
    for (let i = 1; i < 4; i++) {
      rots.push(rots[i - 1].map(([c, r]) => [n - 1 - r, c] as [number, number]));
    }
    return [kind, rots];
  }),
) as Record<Kind, [number, number][][]>;

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Kind | null>(COLS).fill(null));
}

/** Absolute [col, row] of the four cells. */
export function pieceCells(p: Pick<Piece, "kind" | "rot" | "x" | "y">): [number, number][] {
  return SHAPES[p.kind][((p.rot % 4) + 4) % 4].map(([c, r]) => [c + p.x, r + p.y]);
}

export function collides(board: Board, p: Pick<Piece, "kind" | "rot" | "x" | "y">): boolean {
  return pieceCells(p).some(([c, r]) => c < 0 || c >= COLS || r < 0 || r >= ROWS || board[r][c]);
}

function rand(state: number): [number, number] {
  const s = (state + 0x6d2b79f5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), s | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

function draw(bag: Kind[], seed: number): { kind: Kind; bag: Kind[]; seed: number } {
  let rest = bag;
  let s = seed;
  if (rest.length === 0) {
    const shuffled = [...KINDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const [v, next] = rand(s);
      s = next;
      const j = Math.floor(v * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    rest = shuffled;
  }
  return { kind: rest[0], bag: rest.slice(1), seed: s };
}

const labelAt = (labels: string[], i: number) => labels[i % labels.length] ?? "";

function spawnPiece(q: Queued): Piece {
  const n = BASE[q.kind].n;
  return { kind: q.kind, rot: 0, x: Math.floor((COLS - n) / 2), y: 0, label: q.label };
}

export function createGame(seed: number, labels: string[], total: number): Game {
  const first = draw([], seed);
  const second = draw(first.bag, first.seed);
  return {
    board: emptyBoard(),
    piece: spawnPiece({ kind: first.kind, label: labelAt(labels, 0) }),
    next: { kind: second.kind, label: labelAt(labels, 1) },
    bag: second.bag,
    seed: second.seed,
    labels,
    spawned: 2,
    total,
    lines: 0,
    score: 0,
    status: "playing",
  };
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((c) => c === null));
  const cleared = board.length - kept.length;
  const fresh = Array.from({ length: cleared }, () => Array<Kind | null>(COLS).fill(null));
  return { board: [...fresh, ...kept], cleared };
}

const LINE_SCORE = [0, 100, 300, 500, 800];

// Not exported: every move goes through here so a finished game ignores input.
function live(g: Game): g is Game & { piece: Piece } {
  return g.status === "playing" && g.piece !== null;
}

function lock(g: Game & { piece: Piece }): Game {
  const board = g.board.map((row) => [...row]);
  for (const [c, r] of pieceCells(g.piece)) board[r][c] = g.piece.kind;
  const { board: cleared, cleared: n } = clearLines(board);
  const lines = g.lines + n;
  const score = g.score + 4 + (LINE_SCORE[Math.min(n, 4)] ?? 0);
  if (lines >= g.total) {
    return { ...g, board: cleared, piece: null, lines, score, status: "won" };
  }
  const piece = spawnPiece(g.next);
  if (collides(cleared, piece)) {
    return { ...g, board: cleared, piece: null, lines, score, status: "lost" };
  }
  const d = draw(g.bag, g.seed);
  return {
    ...g,
    board: cleared,
    piece,
    next: { kind: d.kind, label: labelAt(g.labels, g.spawned) },
    bag: d.bag,
    seed: d.seed,
    spawned: g.spawned + 1,
    lines,
    score,
  };
}

export function moveH(g: Game, dx: -1 | 1): Game {
  if (!live(g)) return g;
  const moved = { ...g.piece, x: g.piece.x + dx };
  return collides(g.board, moved) ? g : { ...g, piece: moved };
}

// The I piece needs two columns to turn flat against a wall; the rest need one.
const KICKS = [0, 1, -1, 2, -2];

export function rotate(g: Game): Game {
  if (!live(g)) return g;
  const rot = (g.piece.rot + 1) % 4;
  for (const dx of KICKS) {
    const turned = { ...g.piece, rot, x: g.piece.x + dx };
    if (!collides(g.board, turned)) return { ...g, piece: turned };
  }
  return g;
}

/** One gravity step: down a row, or lock if resting. */
export function tick(g: Game): Game {
  if (!live(g)) return g;
  const down = { ...g.piece, y: g.piece.y + 1 };
  return collides(g.board, down) ? lock(g) : { ...g, piece: down };
}

export function softDrop(g: Game): Game {
  if (!live(g)) return g;
  const down = { ...g.piece, y: g.piece.y + 1 };
  return collides(g.board, down) ? lock(g) : { ...g, piece: down, score: g.score + 1 };
}

export function hardDrop(g: Game): Game {
  if (!live(g)) return g;
  let piece = g.piece;
  let dist = 0;
  while (!collides(g.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 };
    dist++;
  }
  return lock({ ...g, piece, score: g.score + dist * 2 });
}

/** Gentle to start, a little quicker per line, never frantic. */
export function gravityMs(lines: number): number {
  return Math.max(400, 900 - lines * 70);
}
