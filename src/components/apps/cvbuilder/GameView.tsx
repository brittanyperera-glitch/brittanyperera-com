import type { CSSProperties, Dispatch } from "react";
import { cvBuilder } from "@/content/cvbuilder";
import { PALETTE } from "@/lib/pixel/icons";
import { COLS, type Game, type Kind, pieceCells } from "@/lib/tetris";
import { Banner } from "./Banner";
import type { GameAction } from "./gameReducer";
import { Lcd } from "./Lcd";

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

type Shown = { kind: Kind; live: boolean } | null;

function shownCells(g: Game): Shown[] {
  const cells: Shown[] = g.board.flatMap((row) =>
    row.map((k) => (k ? { kind: k, live: false } : null)),
  );
  if (g.piece) {
    const kind = g.piece.kind;
    for (const [c, r] of pieceCells(g.piece)) cells[r * COLS + c] = { kind, live: true };
  }
  return cells;
}

/** The face and four bevel shades are derived from `--c` in the stylesheet. */
function Block({ kind, live }: { kind: Kind; live?: boolean }) {
  return (
    <span
      className={live ? "cvb-block cvb-live" : "cvb-block"}
      style={{ "--c": COLOUR[kind] } as CSSProperties}
    />
  );
}

function PiecePreview({
  kind,
  className,
  label,
}: {
  kind: Kind;
  className: string;
  label: string;
}) {
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
    <>
      <div
        className={className}
        data-cols={cols}
        style={{ gridTemplateColumns: `repeat(${cols}, var(--cvb-mini))` }}
        aria-hidden="true"
      >
        {cells}
      </div>
      <b title={label}>{label}</b>
    </>
  );
}

function Tick() {
  return (
    <svg className="cvb-tick" viewBox="0 0 11 11" aria-hidden="true">
      <path
        d="M1.5 6L4.3 8.8L9.6 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  game: Game;
  paused: boolean;
  phone: boolean;
  dispatch: Dispatch<GameAction>;
};

export function GameView({ game, paused, phone, dispatch }: Props) {
  const total = cvBuilder.entries.length;
  const filed = Math.min(game.lines, total);
  const c = cvBuilder.controls;
  const pad: [keyof typeof c, GameAction["type"]][] = [
    ["left", "left"],
    ["rotate", "rotate"],
    ["right", "right"],
    ["down", "down"],
  ];
  return (
    <div className="cvb">
      <Banner />
      <div className="cvb-arena">
        <div className="cvb-left">
          <div className="cvb-cabinet">
            <div
              className="cvb-board"
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
                  <Block key={i} kind={cell.kind} live={cell.live} />
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size grid, position is identity
                  <span key={i} className="cvb-gap" />
                ),
              )}
              {paused && game.status === "playing" ? (
                <span className="cvb-paused">{cvBuilder.pausedLabel}</span>
              ) : null}
            </div>
          </div>
          {phone ? (
            <div className="cvb-pad">
              {pad.map(([key, action]) => (
                <button
                  key={key}
                  type="button"
                  className="pbtn cvb-padkey"
                  aria-label={c[key].label}
                  onClick={() => dispatch({ type: action } as GameAction)}
                >
                  {c[key].glyph}
                </button>
              ))}
            </div>
          ) : (
            <div className="cvb-hint">
              {pad.map(([key]) => (
                <span key={key} className="cvb-key" aria-hidden="true">
                  {c[key].glyph}
                </span>
              ))}
              <span>{cvBuilder.hint}</span>
            </div>
          )}
        </div>
        <aside className="cvb-side">
          <div className="cvb-doc cvb-panel">
            <div className="cvb-list">
              <div className="cvb-list-head">
                <span>{cvBuilder.panelTitle}</span>
                <span>
                  {filed}/{total} {cvBuilder.filedLabel}
                </span>
              </div>
              <ol>
                {cvBuilder.entries.map((e, i) =>
                  i < filed ? (
                    <li
                      key={e.label}
                      className={i === filed - 1 ? "cvb-entry cvb-fresh" : "cvb-entry"}
                    >
                      <Tick />
                      <b>{e.when}</b>
                      <span>{e.label}</span>
                    </li>
                  ) : (
                    <li key={e.label} className="cvb-entry cvb-blank" aria-hidden="true">
                      <span />
                      <span className="cvb-when" />
                      <span className="cvb-what" />
                    </li>
                  ),
                )}
              </ol>
            </div>
            <div
              className="cvb-progress"
              role="progressbar"
              aria-label={cvBuilder.panelTitle}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={filed}
            >
              <i style={{ width: `${(filed / total) * 100}%` }} />
            </div>
          </div>
          <div className="cvb-lcd">
            <div>
              <span className="cvb-lcd-label" aria-hidden="true">
                {cvBuilder.scoreLabel}
              </span>
              <Lcd value={game.score} digits={6} label={`${cvBuilder.scoreLabel} ${game.score}`} />
            </div>
            <div>
              <span className="cvb-lcd-label" aria-hidden="true">
                {cvBuilder.linesLabel}
              </span>
              <Lcd value={game.lines} digits={2} label={`${cvBuilder.linesLabel} ${game.lines}`} />
            </div>
          </div>
          <div className="cvb-pieces">
            {game.piece ? (
              <div className="cvb-panel cvb-now">
                <h5>{cvBuilder.fallingLabel}</h5>
                <PiecePreview
                  kind={game.piece.kind}
                  className="cvb-now-grid"
                  label={game.piece.label}
                />
              </div>
            ) : null}
            <div className="cvb-panel cvb-next">
              <h5>{cvBuilder.nextLabel}</h5>
              <PiecePreview
                kind={game.next.kind}
                className="cvb-next-grid"
                label={game.next.label}
              />
            </div>
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
