"use client";

import { useState } from "react";
import { truths } from "@/content/truths";

export function TruthsWindow() {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const current = truths.rounds[round];
  const last = round === truths.rounds.length - 1;
  const won = picked !== null && current.statements[picked].lie;

  const advance = () => {
    setRound(last ? 0 : round + 1);
    setPicked(null);
  };

  return (
    <>
      <p>{truths.intro}</p>
      <fieldset>
        <legend>{current.label}</legend>
        {current.statements.map((s, i) => (
          <p key={s.text}>
            <button
              type="button"
              className={i === picked ? "pbtn default" : "pbtn"}
              aria-pressed={i === picked}
              onClick={() => picked === null && setPicked(i)}
            >
              {s.text}
              {picked !== null && s.lie ? (
                <>
                  {" "}
                  <strong>{truths.lieTag}</strong>
                </>
              ) : null}
            </button>
          </p>
        ))}
      </fieldset>
      <p role="status" aria-live="polite">
        {picked === null ? "" : `${won ? truths.right : truths.wrong}. ${truths.others}`}
      </p>
      {picked === null ? null : (
        <div className="actions-right">
          <button type="button" className="pbtn default" onClick={advance}>
            {last ? truths.again : truths.next}
          </button>
        </div>
      )}
    </>
  );
}
