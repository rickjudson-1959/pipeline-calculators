"use client";

import { useMemo, useState } from "react";
import {
  calculateGasFlow,
  DEFAULT_GAS_INPUTS,
  formatFixed,
  formatRate,
  parseNumericInput,
  validateGasInputs,
  type GasFlowInputs,
} from "@/lib/gas-flow";
import {
  convertGasField,
  formatInputNumber,
  gasUnitLabels,
  type GasUnitField,
  type UnitSystem,
} from "@/lib/units";

type FieldKey = keyof GasFlowInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
  hint?: string;
};

const FIELD_KEYS: FieldKey[] = [
  "p1",
  "p2",
  "gamma",
  "od",
  "wt",
  "length",
  "efficiency",
];

function pipeFields(unitSystem: UnitSystem): FieldConfig[] {
  const units = gasUnitLabels(unitSystem);
  return [
    {
      key: "p1",
      id: "p1",
      label: "Inlet pressure P1",
      unit: units.pressure,
      hint: "Absolute pressure, not gauge.",
    },
    {
      key: "p2",
      id: "p2",
      label: "Outlet pressure P2",
      unit: units.pressure,
      hint: "Absolute pressure, not gauge. Must be lower than P1.",
    },
    {
      key: "gamma",
      id: "gamma",
      label: "Gas specific gravity",
      unit: "γg",
      hint: "Air = 1.00. Typical pipeline gas is about 0.60. Dimensionless, does not convert.",
    },
    { key: "od", id: "od", label: "Outside diameter", unit: units.diameter },
    { key: "wt", id: "wt", label: "Wall thickness", unit: units.diameter },
    { key: "length", id: "length", label: "Pipeline length", unit: units.length },
    {
      key: "efficiency",
      id: "efficiency",
      label: "Line efficiency E",
      unit: "factor",
      hint: "Typical gathering 0.80 to 0.92. Dimensionless, does not convert.",
    },
  ];
}

function defaultFieldState(): Record<FieldKey, string> {
  return {
    p1: String(DEFAULT_GAS_INPUTS.p1),
    p2: String(DEFAULT_GAS_INPUTS.p2),
    gamma: "0.60",
    od: "508.0",
    wt: String(DEFAULT_GAS_INPUTS.wt),
    length: String(DEFAULT_GAS_INPUTS.length),
    efficiency: String(DEFAULT_GAS_INPUTS.efficiency),
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
    next[key] = formatInputNumber(convertGasField(key as GasUnitField, parsed, from, to));
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

export function GasFlowCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [fields, setFields] = useState(defaultFieldState);
  const units = gasUnitLabels(unitSystem);

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
          p1: parsed.p1,
          p2: parsed.p2,
          gamma: parsed.gamma,
          od: parsed.od,
          wt: parsed.wt,
          length: parsed.length,
          efficiency: parsed.efficiency,
        } as GasFlowInputs)
      : null;

  const errors = ready ? validateGasInputs(ready) : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0 ? calculateGasFlow(ready, { unitSystem }) : null;
  const idDigits = unitSystem === "metric" ? 1 : 3;
  const dropDigits = unitSystem === "metric" ? 0 : 1;

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
              Switching units converts the numbers already in the form. Gas
              gravity and line efficiency stay the same.
            </p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="gas-params-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="gas-params-heading">Line &amp; Gas Parameters</h2>
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
          <h2 id="results-heading">Flow &amp; Pressure Drop</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Inside diameter"
            value={result ? `${formatFixed(result.id, idDigits)} ${units.diameter}` : "--"}
            hint="OD minus two wall thicknesses"
          />
          <ResultStat
            label="Pressure drop"
            value={
              result
                ? `${formatFixed(result.pressureDrop, dropDigits)} ${units.pressure}`
                : "--"
            }
            hint="P1 minus P2"
          />
          <ResultStat
            label="Weymouth flow"
            value={result ? `${formatRate(result.weymouth)} ${units.flow}` : "--"}
            hint="Shorter, higher-friction gathering estimate"
          />
          <ResultStat
            label="Panhandle A flow"
            value={result ? `${formatRate(result.panhandleA)} ${units.flow}` : "--"}
            hint="Medium-to-large transmission estimate"
          />
          <ResultStat
            label="Panhandle B flow"
            value={result ? `${formatRate(result.panhandleB)} ${units.flow}` : "--"}
            hint="Large, smooth, high-pressure line estimate"
          />
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
