import { type CSSProperties, useEffect, useRef } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { copy } from "@/content/copy";
import type { SetupState } from "@/lib/setup";
import type { Visitor } from "@/lib/types";

const STEP_TITLE_ID = "setup-step-title";

// "n of 4" has no key in src/content/copy.ts yet; this is the one literal until it does.
const countText = (n: number, total: number) =>
  copy.setup.count.replace("{n}", String(n)).replace("{total}", String(total));

type Props = {
  step: SetupState["step"];
  visitor: Visitor;
  accent: string;
  /** Index into copy.setup.hello for the cycling greeting. */
  helloIndex: number;
  /** Reduced motion: show every greeting at once instead of cycling. */
  reduced: boolean;
  installing: boolean;
  /** Install line to show, or -1 before the first one. */
  installLine: number;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
  onGoAhead: () => void;
  onPickVisitor: (v: Visitor) => void;
  onPickAccent: (hex: string) => void;
};

export function SetupAssistant({
  step,
  visitor,
  accent,
  helloIndex,
  reduced,
  installing,
  installLine,
  onSkip,
  onBack,
  onNext,
  onGoAhead,
  onPickVisitor,
  onPickAccent,
}: Props) {
  const s = copy.setup;
  const nextRef = useRef<HTMLButtonElement>(null);
  const last = step === s.steps.length - 1;
  const visitorLabel = s.visitors.find((v) => v.id === visitor)?.label ?? visitor;
  const swatch = s.swatches.find((w) => w.hex === accent);
  const hello = s.hello[helloIndex % s.hello.length];
  const pct = installing ? Math.round(((installLine + 1) / s.installLines.length) * 100) : 0;

  // Mounts when the steps phase starts: put focus where Return does the obvious thing.
  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  return (
    <div className="setup" role="dialog" aria-modal="true" aria-label={s.windowTitle}>
      <div className="assistant bevel">
        <div className="titlebar">
          <span className="t">{s.windowTitle}</span>
        </div>
        <div className="assistant-body well">
          <div className="guide">
            <div className="speech">{s.speech[step]}</div>
            <div className="portrait well">
              <PixelIcon name="person" size={60} label={s.portraitAlt} />
            </div>
          </div>
          <div className="pane">
            <div className="step-title" id={STEP_TITLE_ID}>
              {s.steps[step].title}
            </div>
            <p className="step-sub">{s.steps[step].sub}</p>

            {step === 0 &&
              (reduced ? (
                <div className="hello-all" aria-hidden="true">
                  {s.hello.map((h) => (
                    <span key={h.lang} lang={h.lang}>
                      {h.text}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="hello" lang={hello.lang} key={hello.lang} aria-hidden="true">
                  {hello.text}
                </div>
              ))}

            {step === 1 && (
              <div className="radio-list" role="radiogroup" aria-labelledby={STEP_TITLE_ID}>
                {s.visitors.map((v) => (
                  // biome-ignore lint/a11y/useSemanticElements: a styled radio row, not a form input
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={v.id === visitor}
                    className={v.id === visitor ? "radio picked" : "radio"}
                    onClick={() => onPickVisitor(v.id)}
                  >
                    <span className="dot" />
                    <span>
                      <b>{v.label}</b> <small>{v.hint}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <div className="swatches" role="radiogroup" aria-labelledby={STEP_TITLE_ID}>
                  {s.swatches.map((w) => (
                    // biome-ignore lint/a11y/useSemanticElements: a styled radio row, not a form input
                    <button
                      key={w.hex}
                      type="button"
                      role="radio"
                      aria-checked={w.hex === accent}
                      className={w.hex === accent ? "swatch picked" : "swatch"}
                      style={{ "--c": w.hex } as CSSProperties}
                      onClick={() => onPickAccent(w.hex)}
                    >
                      <i />
                      {w.name}
                    </button>
                  ))}
                </div>
                <p className="preview-sel">
                  {s.previewBefore} <span>{s.previewHighlight}</span>
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <div className="summary well">
                  <b>{s.summaryVisitor}</b> <span>{visitorLabel}</span>
                  <br />
                  <b>{s.summaryColour}</b> <span>{swatch?.name ?? accent}</span>
                </div>
                {installing && (
                  <div className="installing">
                    <div className="bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <div className="install-line" aria-live="polite">
                      {installLine >= 0 ? s.installLines[installLine] : " "}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="assistant-foot">
          <span className="count">{countText(step + 1, s.steps.length)}</span>
          <span className="spacer" />
          <button type="button" className="pbtn" onClick={onSkip}>
            {s.skip}
          </button>
          <button
            type="button"
            className="pbtn"
            disabled={step === 0 || installing}
            onClick={onBack}
          >
            {s.back}
          </button>
          <button
            type="button"
            ref={nextRef}
            className="pbtn default"
            disabled={installing}
            onClick={last ? onGoAhead : onNext}
          >
            {last ? s.goAhead : s.next}
          </button>
        </div>
      </div>
    </div>
  );
}
