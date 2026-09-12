"use client";

import { useMemo, useState } from "react";
import {
  calculateB31g,
  DEFAULT_B31G_INPUTS,
  formatOperatingGate,
  formatPercent,
  formatPressure,
  isPassingGate,
  parseNumericInput,
  validateB31gInputs,
  type B31gInputs,
} from "@/lib/b31g";
import {
  b31gUnitLabels,
  convertB31gField,
  formatInputNumber,
  type B31gUnitField,
  type UnitSystem,
} from "@/lib/units";

type FieldKey = keyof B31gInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
  hint?: string;
};

const FIELD_KEYS: FieldKey[] = [
  "od",
  "wt",
  "smys",
  "f",
  "depth",
  "length",
  "poper",
];

function pipeFields(unitSystem: UnitSystem): FieldConfig[] {
  const units = b31gUnitLabels(unitSystem);
  return [
    { key: "od", id: "od", label: "Outside diameter", unit: units.diameter },
    { key: "wt", id: "wt", label: "Nominal wall thickness", unit: units.diameter },
    { key: "smys", id: "smys", label: "Pipe grade SMYS", unit: units.smys },
    {
      key: "f",
      id: "design-f",
      label: "Design factor F",
      unit: "factor",
      hint: "Dimensionless. Typical liquid or Class 1 Div 2 value is 0.72. Does not convert.",
    },
    { key: "depth", id: "depth", label: "Defect depth d", unit: units.diameter },
    {
      key: "length",
      id: "length",
      label: "Defect axial length L",
      unit: units.diameter,
    },
    {
      key: "poper",
      id: "poper",
      label: "Current operating pressure",
      unit: units.pressure,
      hint: "Compared with Modified B31G safe pressure for the operating safety gate.",
    },
  ];
}

function defaultFieldState(): Record<FieldKey, string> {
  return {
    od: "508.0",
    wt: "9.5",
    smys: String(DEFAULT_B31G_INPUTS.smys),
    f: "0.72",
    depth: "2.5",
    length: "150.0",
    poper: String(DEFAULT_B31G_INPUTS.poper),
  };
}

function convertFieldState(
  fields: Record<FieldKey, string>,
  from: UnitSystem,
  to: UnitSystem,
): Record<FieldKey, string> {
  const next = { ...fields };
  for (const key of FIELD_KEYS) {
    const parsed = parseNumericInput(fields[key]);
    if (parsed === null) {
      continue;
    }
    next[key] = formatInputNumber(convertB31gField(key as B31gUnitField, parsed, from, to));
  }
  return next;
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
      {field.hint ? <p className="field-hint">{field.hint}</p> : null}
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

export function B31gCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [fields, setFields] = useState(defaultFieldState);
  const units = b31gUnitLabels(unitSystem);

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
          od: parsed.od,
          wt: parsed.wt,
          smys: parsed.smys,
          f: parsed.f,
          depth: parsed.depth,
          length: parsed.length,
          poper: parsed.poper,
        } as B31gInputs)
      : null;

  const errors = ready ? validateB31gInputs(ready) : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0 ? calculateB31g(ready, { unitSystem }) : null;

  function updateField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) {
      return;
    }
    setFields((current) => convertFieldState(current, unitSystem, next));
    setUnitSystem(next);
  }

  function resetDefaults() {
    setUnitSystem("metric");
    setFields(defaultFieldState());
  }

  return (
    <div className="calculator">
      <div className="calculator-toolbar">
        <p className="live-note">Results update as you type.</p>
        <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
          Reset defaults
        </button>
      </div>

      <section className="panel" aria-labelledby="setup-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="setup-heading">Units</h2>
        </div>
        <div className="setup-grid">
          <div className="field">
            <p id="unit-system-label" className="field-label">
              Unit system
            </p>
            <div
              className="unit-toggle"
              role="radiogroup"
              aria-labelledby="unit-system-label"
            >
              <button
                type="button"
                role="radio"
                aria-checked={unitSystem === "metric"}
                className={unitSystem === "metric" ? "is-active" : ""}
                onClick={() => changeUnitSystem("metric")}
              >
                Metric SI
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={unitSystem === "us"}
                className={unitSystem === "us" ? "is-active" : ""}
                onClick={() => changeUnitSystem("us")}
              >
                US Customary
              </button>
            </div>
            <p className="field-hint">
              Switching units converts the numbers already in the form. Design
              factor F stays the same.
            </p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="pipe-params-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="pipe-params-heading">Pipe &amp; Defect Parameters</h2>
        </div>
        <div className="field-grid">
          {pipeFields(unitSystem).map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={fields[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="results-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 3</p>
          <h2 id="results-heading">Remaining Strength</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Uncorroded MAOP"
            value={result ? `${formatPressure(result.maop)} ${units.pressure}` : "--"}
            hint="Barlow: 2 x WT x SMYS x F / OD"
          />
          <ResultStat
            label="Depth ratio d/t"
            value={result ? `${formatPercent(result.dt * 100)}%` : "--"}
            hint="Rejects above 80 percent metal loss"
          />
          <ResultStat
            label="B31G safe pressure P'_B31G"
            value={result ? `${formatPressure(result.pB31g)} ${units.pressure}` : "--"}
            hint="Original B31G parabolic / Folias A, capped at MAOP"
          />
          <ResultStat
            label="Modified B31G safe pressure P'_Mod"
            value={result ? `${formatPressure(result.pMod)} ${units.pressure}` : "--"}
            hint="0.85dL / RSTRENG-style Folias z, capped at MAOP"
          />
          <ResultStat
            label="Modified RSF factor"
            value={result ? `${formatPercent(result.rsfMod)}%` : "--"}
            hint="P'_Mod / uncorroded MAOP"
          />
        </div>

        <div className="gate-grid">
          <article
            className={`gate ${
              result ? (isPassingGate(result.gate) ? "is-pass" : "is-fail") : ""
            }`}
          >
            <p className="gate-kicker">Operating safety gate (Modified)</p>
            <h3>Depth at or below 80%, and operating pressure at or below P&apos;_Mod</h3>
            <p className="gate-status">
              {result ? formatOperatingGate(result.gate) : "Awaiting inputs"}
            </p>
            {ready && result && result.gate === "reject-depth" ? (
              <p>
                Depth ratio is {formatPercent(result.dt * 100)}%, above the 80%
                metal-loss cutoff. Original and Modified B31G Level 1 do not
                apply.
              </p>
            ) : null}
            {ready && result && result.gate === "safe" ? (
              <p>
                Operating pressure {formatPressure(ready.poper)} {units.pressure}{" "}
                is at or below Modified B31G safe pressure{" "}
                {formatPressure(result.pMod)} {units.pressure}.
              </p>
            ) : null}
            {ready && result && result.gate === "derating" ? (
              <p>
                Operating pressure {formatPressure(ready.poper)} {units.pressure}{" "}
                is above Modified B31G safe pressure{" "}
                {formatPressure(result.pMod)} {units.pressure}. Derate or assess
                further.
              </p>
            ) : null}
          </article>
        </div>
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
