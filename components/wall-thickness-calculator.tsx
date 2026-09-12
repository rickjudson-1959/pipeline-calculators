"use client";

import { useMemo, useState } from "react";
import {
  calculateWallThickness,
  DEFAULT_DESIGN_CODE,
  DEFAULT_WALL_INPUTS,
  DESIGN_CODES,
  formatDesignFactor,
  formatFixed,
  getDesignFactor,
  parseNumericInput,
  validateWallInputs,
  type DesignCode,
  type WallThicknessInputs,
} from "@/lib/wall-thickness";
import {
  convertWallField,
  formatInputNumber,
  wallUnitLabels,
  type UnitSystem,
  type WallUnitField,
} from "@/lib/units";

type FieldKey = keyof WallThicknessInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
};

const FIELD_KEYS: FieldKey[] = ["od", "smys", "pDesign", "corr", "tnom"];

function pipeFields(unitSystem: UnitSystem): FieldConfig[] {
  const units = wallUnitLabels(unitSystem);
  return [
    { key: "od", id: "od", label: "Outside diameter", unit: units.diameter },
    { key: "smys", id: "smys", label: "SMYS", unit: units.smys },
    { key: "pDesign", id: "p-design", label: "Design pressure", unit: units.pressure },
    { key: "corr", id: "corr", label: "Corrosion allowance", unit: units.thickness },
    {
      key: "tnom",
      id: "tnom",
      label: "Selected nominal wall thickness",
      unit: units.thickness,
    },
  ];
}

function defaultFieldState(): Record<FieldKey, string> {
  return {
    od: String(DEFAULT_WALL_INPUTS.od),
    smys: String(DEFAULT_WALL_INPUTS.smys),
    pDesign: String(DEFAULT_WALL_INPUTS.pDesign),
    corr: String(DEFAULT_WALL_INPUTS.corr),
    tnom: String(DEFAULT_WALL_INPUTS.tnom),
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
    next[key] = formatInputNumber(convertWallField(key as WallUnitField, parsed, from, to));
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

function isDesignCode(value: string): value is DesignCode {
  return DESIGN_CODES.some((standard) => standard.id === value);
}

export function WallThicknessCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [code, setCode] = useState<DesignCode>(DEFAULT_DESIGN_CODE);
  const [fields, setFields] = useState(defaultFieldState);
  const units = wallUnitLabels(unitSystem);

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
          smys: parsed.smys,
          pDesign: parsed.pDesign,
          corr: parsed.corr,
          tnom: parsed.tnom,
        } as WallThicknessInputs)
      : null;

  const errors = ready ? validateWallInputs(ready) : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0
      ? calculateWallThickness(ready, { unitSystem, code })
      : null;
  const factorLabel = formatDesignFactor(getDesignFactor(code));
  const thicknessDigits = unitSystem === "metric" ? 2 : 4;

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
    setCode(DEFAULT_DESIGN_CODE);
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
          <h2 id="setup-heading">Units &amp; Design Code</h2>
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
              Switching units converts the numbers already in the form.
            </p>
          </div>
          <div className="field">
            <label htmlFor="design-code">Design code and location class</label>
            <div className="field-control">
              <select
                id="design-code"
                name="design-code"
                value={code}
                onChange={(event) => {
                  if (isDesignCode(event.target.value)) {
                    setCode(event.target.value);
                  }
                }}
              >
                {DESIGN_CODES.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.label} (F={formatDesignFactor(standard.designFactor)})
                  </option>
                ))}
              </select>
            </div>
            <p className="field-hint">
              Sets the design factor F to {factorLabel}.
            </p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="pipe-params-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="pipe-params-heading">Pipe &amp; Design Parameters</h2>
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
          <h2 id="results-heading">Wall Thickness &amp; MAOP</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Design factor F"
            value={result ? formatDesignFactor(result.designFactor) : "--"}
            hint="From the selected design code and location class"
          />
          <ResultStat
            label="Min required wall t_min"
            value={
              result
                ? `${formatFixed(result.tMin, thicknessDigits)} ${units.thickness}`
                : "--"
            }
            hint="Pressure design thickness plus corrosion allowance"
          />
          <ResultStat
            label="Design pressure capacity (MAOP)"
            value={
              result ? `${formatFixed(result.maop, 1)} ${units.pressure}` : "--"
            }
            hint="Barlow MAOP for the selected nominal wall after corrosion"
          />
        </div>

        <div className="gate-grid">
          <article
            className={`gate ${result ? (result.isCompliant ? "is-pass" : "is-fail") : ""}`}
          >
            <p className="gate-kicker">Thickness compliance</p>
            <h3>MAOP at or above design pressure</h3>
            <p className="gate-status">
              {result
                ? result.isCompliant
                  ? "COMPLIANT"
                  : "UNDERSIZED"
                : "Awaiting inputs"}
            </p>
            {ready && result && !result.isCompliant ? (
              <p>
                MAOP is {formatFixed(result.maop, 1)} {units.pressure}, which is{" "}
                {formatFixed(ready.pDesign - result.maop, 1)} {units.pressure}{" "}
                below the design pressure.
              </p>
            ) : null}
            {ready && result && result.isCompliant ? (
              <p>
                Selected {formatFixed(ready.tnom, thicknessDigits)} {units.thickness}{" "}
                nominal wall supports {formatFixed(result.maop, 1)} {units.pressure}.
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
