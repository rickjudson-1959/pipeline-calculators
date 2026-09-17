"use client";

import { useMemo, useState } from "react";
import {
  calculateSideboomSpanLift,
  DEFAULT_SIDEBOOM_INPUTS,
  formatFixed,
  parseNumericInput,
  SIDEBOOM_REFERENCE,
  validateSideboomInputs,
  type SideboomInputs,
} from "@/lib/sideboom-span-lift";

type FieldKey = keyof SideboomInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
};

const FIELDS: FieldConfig[] = [
  { key: "D", id: "sideboom-d", label: "Pipe outside diameter", unit: "in" },
  { key: "t", id: "sideboom-t", label: "Wall thickness", unit: "in" },
  {
    key: "w",
    id: "sideboom-w",
    label: "Net unit weight (pipe + coating + contents)",
    unit: "lb/in",
  },
  {
    key: "S_allow",
    id: "sideboom-s-allow",
    label: "Allowable bending stress (yield limit)",
    unit: "psi",
  },
];

function defaultFieldState(): Record<FieldKey, string> {
  return {
    D: String(DEFAULT_SIDEBOOM_INPUTS.D),
    t: String(DEFAULT_SIDEBOOM_INPUTS.t),
    w: String(DEFAULT_SIDEBOOM_INPUTS.w),
    S_allow: String(DEFAULT_SIDEBOOM_INPUTS.S_allow),
  };
}

function NumberField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={field.id}>{field.label}</label>
      <div className="field-control">
        <input
          id={field.id}
          name={field.id}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="unit">{field.unit}</span>
      </div>
    </div>
  );
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

export function SideboomSpanLiftCalculator() {
  const [fields, setFields] = useState(defaultFieldState);

  const parsed = useMemo(() => {
    const values = {} as Record<FieldKey, number | null>;
    (Object.keys(fields) as FieldKey[]).forEach((key) => {
      values[key] = parseNumericInput(fields[key]);
    });
    return values;
  }, [fields]);

  const ready =
    (Object.keys(parsed) as FieldKey[]).every((key) => parsed[key] !== null)
      ? ({
          D: parsed.D,
          t: parsed.t,
          w: parsed.w,
          S_allow: parsed.S_allow,
        } as SideboomInputs)
      : null;

  const errors = ready
    ? validateSideboomInputs(ready)
    : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0 ? calculateSideboomSpanLift(ready) : null;

  function updateField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function resetDefaults() {
    setFields(defaultFieldState());
  }

  return (
    <div className="calculator">
      <div className="calculator-toolbar">
        <p className="live-note">Results update as you type. US Customary only.</p>
        <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
          Reset defaults
        </button>
      </div>

      <section className="panel" aria-labelledby="sideboom-inputs-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="sideboom-inputs-heading">Pipe and Lift Inputs</h2>
        </div>
        <div className="field-grid">
          {FIELDS.map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={fields[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="sideboom-results-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="sideboom-results-heading">Span and Lift Load</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Moment of inertia"
            value={result ? `${formatFixed(result.I, 2)} in^4` : "--"}
            hint="Hollow-section I from the cited equation"
          />
          <ResultStat
            label="Maximum safe span (L_s)"
            value={result ? `${formatFixed(result.L_s, 1)} in` : "--"}
            hint="Distance between sidebooms"
          />
          <ResultStat
            label="Required lift capacity per sideboom"
            value={result ? `${formatFixed(result.Lift_Load, 0)} lbs` : "--"}
            hint="Net unit weight times L_s"
          />
          <ResultStat
            label="Spanning stress"
            value={result ? `${formatFixed(result.sigma_bs, 0)} psi` : "--"}
            hint="sigma_bs from the cited spanning-stress note"
          />
        </div>
        <p className="field-hint">
          Citation: {SIDEBOOM_REFERENCE}.
        </p>
      </section>

      {errors.length > 0 ? (
        <div className="input-errors" role="status">
          <p>Results pause until every field is a valid number.</p>
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
