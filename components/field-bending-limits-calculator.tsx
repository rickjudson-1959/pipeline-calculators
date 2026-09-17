"use client";

import { useMemo, useState } from "react";
import {
  calculateFieldBendingLimits,
  COATING_DESIGNS,
  DEFAULT_FIELD_BENDING_INPUTS,
  FIELD_BENDING_REFERENCE,
  formatFixed,
  isCoatingDesign,
  parseNumericInput,
  validateFieldBendingInputs,
  type CoatingDesign,
  type FieldBendingInputs,
} from "@/lib/field-bending-limits";

function defaultDiameter(): string {
  return String(DEFAULT_FIELD_BENDING_INPUTS.D);
}

function ResultStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="result-stat">
      <p className="result-label">{label}</p>
      <p className="result-value">{value}</p>
      {hint ? <p className="result-hint">{hint}</p> : null}
    </div>
  );
}

export function FieldBendingLimitsCalculator() {
  const [diameter, setDiameter] = useState(defaultDiameter);
  const [coatingType, setCoatingType] = useState<CoatingDesign>(
    DEFAULT_FIELD_BENDING_INPUTS.coating_type,
  );

  const parsedD = useMemo(() => parseNumericInput(diameter), [diameter]);

  const ready: FieldBendingInputs | null =
    parsedD !== null
      ? {
          D: parsedD,
          coating_type: coatingType,
        }
      : null;

  const errors = ready
    ? validateFieldBendingInputs(ready)
    : ["Enter a number for pipe outside diameter."];
  const result =
    ready && errors.length === 0 ? calculateFieldBendingLimits(ready) : null;

  function resetDefaults() {
    setDiameter(defaultDiameter());
    setCoatingType(DEFAULT_FIELD_BENDING_INPUTS.coating_type);
  }

  return (
    <div className="calculator">
      <div className="calculator-toolbar">
        <p className="live-note">Results update as you type. US Customary only.</p>
        <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
          Reset defaults
        </button>
      </div>

      <section className="panel" aria-labelledby="field-bend-inputs-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="field-bend-inputs-heading">Pipe and Coating</h2>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="field-bend-d">Pipe outside diameter</label>
            <div className="field-control">
              <input
                id="field-bend-d"
                name="field-bend-d"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={diameter}
                onChange={(event) => setDiameter(event.target.value)}
              />
              <span className="unit">in</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="field-bend-coating">Coating design</label>
            <div className="field-control">
              <select
                id="field-bend-coating"
                name="field-bend-coating"
                value={coatingType}
                onChange={(event) => {
                  if (isCoatingDesign(event.target.value)) {
                    setCoatingType(event.target.value);
                  }
                }}
              >
                {COATING_DESIGNS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <p className="field-hint">
              Strain limits come from the Appendix A coating table in the math
              module, not from this page.
            </p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="field-bend-results-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="field-bend-results-heading">Strain and Deflection Limits</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Allowable strain limit"
            value={result ? `${formatFixed(result.strain_limit_pct, 0)} %` : "--"}
            hint="Appendix A limit for the selected coating design"
          />
          <ResultStat
            label="Maximum deflection limit"
            value={result ? `${formatFixed(result.max_deflection, 3)} in` : "--"}
            hint="Strain limit times outside diameter"
          />
        </div>
        <p className="field-hint">Citation: {FIELD_BENDING_REFERENCE}.</p>
      </section>

      {errors.length > 0 ? (
        <div className="input-errors" role="status">
          <p>Results pause until every field is valid.</p>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
