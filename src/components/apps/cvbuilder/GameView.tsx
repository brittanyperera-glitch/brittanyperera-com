import type { Dispatch } from "react";
import { cvBuilder } from "@/content/cvbuilder";
import { PALETTE } from "@/lib/pixel/icons";
import { COLS, type Game, type Kind, pieceCells } from "@/lib/tetris";
import type { GameAction } from "./gameReducer";

// Muted palette keys from the desktop icons, one per piece.
const COLOUR: Record<Kind, string> = {
  I: PALETTE.c,
  O: PALETTE.y,
  T: PALETTE.p,
  S: PALETTE.l,
  Z: PALETTE.r,
  J: PALETTE.b,
  L: PALETTE.o,
};

type Shown = { kind: Kind; label?: string } | null;

function shownCells(g: Game): Shown[] {
  const cells: Shown[] = g.board.flatMap((row) => row.map((k) => (k ? { kind: k } : null)));
  if (g.piece) {
    const own = pieceCells(g.piece);
    own.forEach(([c, r], i) => {
      cells[r * COLS + c] = { kind: g.piece?.kind as Kind, label: i === 0 ? g.piece?.label : "" };
    });
  }
  return cells;
}

function Block({ kind, label }: { kind: Kind; label?: string }) {
  return (
    <span className="cvb-block" style={{ background: COLOUR[kind] }}>
      {label ? <span className="cvb-tag">{label}</span> : null}
    </span>
  );
}

function NextPreview({ kind }: { kind: Kind }) {
  const shape = pieceCells({ kind, rot: 0, x: 0, y: 0 });
  const on = new Set(shape.map(([c, r]) => `${c},${r}`));
  // Crop to the piece's own box: the empty rows of the 4x4 would push the label away from it.
  const [c0, c1] = [Math.min(...shape.map(([c]) => c)), Math.max(...shape.map(([c]) => c))];
  const [r0, r1] = [Math.min(...shape.map(([, r]) => r)), Math.max(...shape.map(([, r]) => r))];
  const cols = c1 - c0 + 1;
  const cells = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      cells.push(
        on.has(`${c},${r}`) ? (
          <Block key={`${c},${r}`} kind={kind} />
        ) : (
          <span key={`${c},${r}`} className="cvb-gap" />
        ),
      );
    }
  }
  return (
    <div
      className="cvb-next-grid"
      data-cols={cols}
      style={{ gridTemplateColumns: `repeat(${cols}, 10px)` }}
      aria-hidden="true"
    >
      {cells}
    </div>
  );
}

type Props = {
  game: Game;
  paused: boolean;
  phone: boolean;
  dispatch: Dispatch<GameAction>;
};

export function GameView({ game, paused, phone, dispatch }: Props) {
  const filed = Math.min(game.lines, cvBuilder.entries.length);
  const c = cvBuilder.controls;
  const pad: [keyof typeof c, GameAction["type"]][] = [
    ["left", "left"],
    ["rotate", "rotate"],
    ["right", "right"],
    ["down", "down"],
  ];
  return (
    <div className="cvb">
      <p className="cvb-intro">{cvBuilder.intro}</p>
      <div className="cvb-main">
        <div className="cvb-left">
          <div
            className="cvb-board well"
            role="img"
            aria-label={cvBuilder.boardLabel}
            data-piece-x={game.piece?.x}
            data-piece-y={game.piece?.y}
            data-piece-rot={game.piece?.rot}
            style={{ gridTemplateColumns: `repeat(${COLS}, var(--cvb-cell))` }}
          >
            {shownCells(game).map((cell, i) =>
              cell ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size grid, position is identity
                <Block key={i} kind={cell.kind} label={cell.label} />
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size grid, position is identity
                <span key={i} className="cvb-gap" />
              ),
            )}
            {paused && game.status === "playing" ? (
              <span className="cvb-paused">{cvBuilder.pausedLabel}</span>
            ) : null}
          </div>
          {phone ? (
            <div className="cvb-pad">
              {pad.map(([key, action]) => (
                <button
                  key={key}
                  type="button"
                  className="pbtn"
                  aria-label={c[key].label}
                  onClick={() => dispatch({ type: action } as GameAction)}
                >
                  {c[key].glyph}
                </button>
              ))}
            </div>
          ) : (
            <p className="cvb-hint">{cvBuilder.hint}</p>
          )}
        </div>
        <aside className="cvb-side">
          <div className="cvb-doc well">
            <div className="cvb-doc-head">
              <span>{cvBuilder.panelTitle}</span>
              <span>
                {filed}/{cvBuilder.entries.length} {cvBuilder.filedLabel}
              </span>
            </div>
            <ol>
              {cvBuilder.entries.map((e, i) =>
                i < filed ? (
                  <li key={e.label} className="cvb-entry">
                    <b>{e.when}</b> {e.label}
                  </li>
                ) : (
                  <li key={e.label} className="cvb-entry cvb-blank" aria-hidden="true" />
                ),
              )}
            </ol>
          </div>
          <div className="cvb-stats">
            <div>
              {cvBuilder.scoreLabel} {game.score}
            </div>
            <div>
              {cvBuilder.linesLabel} {game.lines}
            </div>
            {game.piece ? (
              <div>
                {cvBuilder.fallingLabel}: <b>{game.piece.label}</b>
              </div>
            ) : null}
          </div>
          <div className="cvb-next">
            <span>{cvBuilder.nextLabel}</span>
            <NextPreview kind={game.next.kind} />
            <b>{game.next.label}</b>
          </div>
          {game.status === "playing" ? null : (
            <button type="button" className="pbtn" onClick={() => dispatch({ type: "restart" })}>
              {cvBuilder.again}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
