"use client";

import { useMemo, useState } from "react";
import {
  calculateWallThickness,
  compareWallStandards,
  DEFAULT_DESIGN_CODE,
  DEFAULT_WALL_INPUTS,
  DESIGN_CODES,
  formatCompliance,
  formatDesignFactor,
  formatFixed,
  getDesignFactor,
  parseNumericInput,
  SLENDERNESS_LIMIT,
  validateWallInputs,
  type DesignCode,
  type WallComparisonRow,
  type WallThicknessInputs,
} from "@/lib/wall-thickness";
import {
  convertWallField,
  formatInputNumber,
  wallUnitLabels,
  type UnitSystem,
} from "@/lib/units";

type FieldKey = keyof WallThicknessInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
  hint?: string;
};

const FIELD_KEYS: FieldKey[] = [
  "od",
  "smys",
  "pDesign",
  "corr",
  "tnom",
  "jointE",
  "tempT",
];

function pipeFields(unitSystem: UnitSystem): FieldConfig[] {
  const units = wallUnitLabels(unitSystem);
  const tempLimit = unitSystem === "metric" ? "121 °C" : "250 °F";
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
    {
      key: "jointE",
      id: "joint-e",
      label: "Longitudinal joint efficiency E",
      unit: "factor",
      hint: "1.00 for Seamless / ERW. Use a lower value for EFW or lap weld.",
    },
    {
      key: "tempT",
      id: "temp-t",
      label: "Temperature derating factor T",
      unit: "factor",
      hint: `T stays 1.00 at or below ${tempLimit} per B31.4 / B31.8. This tool does not apply a full temperature table.`,
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
    jointE: "1.00",
    tempT: "1.00",
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
    next[key] = formatInputNumber(convertWallField(key, parsed, from, to));
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

function isDesignCode(value: string): value is DesignCode {
  return DESIGN_CODES.some((standard) => standard.id === value);
}

function slendernessLabel(ok: boolean): "PASS" | "FAIL" {
  return ok ? "PASS" : "FAIL";
}

function ComparisonGrid({
  rows,
  selectedCode,
  unitSystem,
}: {
  rows: WallComparisonRow[];
  selectedCode: DesignCode;
  unitSystem: UnitSystem;
}) {
  const units = wallUnitLabels(unitSystem);
  const thicknessDigits = unitSystem === "metric" ? 2 : 4;
  const pressureDigits = unitSystem === "metric" ? 0 : 1;

  return (
    <div className="compare-wrap">
      <table className="compare-table">
        <caption>
          Same OD, SMYS, design pressure, corrosion allowance, nominal wall, E,
          and T across every encoded location class. Encoded design-factor
          checks only.
        </caption>
        <thead>
          <tr>
            <th scope="col">Code / class</th>
            <th scope="col">F</th>
            <th scope="col">t_min ({units.thickness})</th>
            <th scope="col">MAOP ({units.pressure})</th>
            <th scope="col">Thickness</th>
            <th scope="col">D/t_min</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isPrimary = row.code === selectedCode;
            return (
              <tr
                key={row.code}
                className={isPrimary ? "is-primary" : undefined}
              >
                <th scope="row">
                  {row.label}
                  {isPrimary ? (
                    <span className="compare-primary-tag">Primary</span>
                  ) : null}
                </th>
                <td>{formatDesignFactor(row.designFactor)}</td>
                <td>{formatFixed(row.tMin, thicknessDigits)}</td>
                <td>{formatFixed(row.maop, pressureDigits)}</td>
                <td>
                  <span
                    className={`compare-flag ${row.isCompliant ? "is-pass" : "is-fail"}`}
                  >
                    {formatCompliance(row.isCompliant)}
                  </span>
                </td>
                <td>
                  <span
                    className={`compare-flag ${row.dtMinOk ? "is-pass" : "is-fail"}`}
                  >
                    {formatFixed(row.dtMin, 1)} {slendernessLabel(row.dtMinOk)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
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
          jointE: parsed.jointE,
          tempT: parsed.tempT,
        } as WallThicknessInputs)
      : null;

  const errors = ready ? validateWallInputs(ready) : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0
      ? calculateWallThickness(ready, { unitSystem, code })
      : null;
  const comparison =
    ready && errors.length === 0 ? compareWallStandards(ready, { unitSystem }) : [];
  const factorLabel = formatDesignFactor(getDesignFactor(code));
  const thicknessDigits = unitSystem === "metric" ? 2 : 4;
  const stressDigits = unitSystem === "metric" ? 2 : 0;
  const pressureDigits = unitSystem === "metric" ? 0 : 1;
  const slendernessOk = result ? result.dtNomOk && result.dtMinOk : false;

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
              Switching units converts the numbers already in the form. E and T
              stay the same.
            </p>
          </div>
          <div className="field">
            <label htmlFor="design-code">Primary design code and location class</label>
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
              Sets the primary-panel design factor F to {factorLabel}. The
              comparison grid still shows every encoded class.
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
            hint="From the selected primary design code and location class"
          />
          <ResultStat
            label="Allowable hoop stress S"
            value={
              result
                ? `${formatFixed(result.allowableStress, stressDigits)} ${units.smys}`
                : "--"
            }
            hint="S = F x SMYS"
          />
          <ResultStat
            label="Pressure design thickness t_p"
            value={
              result
                ? `${formatFixed(result.pressureThickness, thicknessDigits)} ${units.thickness}`
                : "--"
            }
            hint="t_p = (P x D) / (2 x S x E x T)"
          />
          <ResultStat
            label="Min required wall t_min"
            value={
              result
                ? `${formatFixed(result.tMin, thicknessDigits)} ${units.thickness}`
                : "--"
            }
            hint="t_min = t_p + corrosion allowance"
          />
          <ResultStat
            label="Design pressure capacity (MAOP)"
            value={
              result
                ? `${formatFixed(result.maop, pressureDigits)} ${units.pressure}`
                : "--"
            }
            hint="MAOP = 2 x (t_nom - A) x S x E x T / D"
          />
          <ResultStat
            label="D/t slenderness"
            value={
              result
                ? `${formatFixed(result.dtNom, 1)} nom / ${formatFixed(result.dtMin, 1)} min`
                : "--"
            }
            hint={`Limit is D/t of ${SLENDERNESS_LIMIT} or less for both checks`}
          />
        </div>

        <div className="gate-grid">
          <article
            className={`gate ${result ? (result.isCompliant ? "is-pass" : "is-fail") : ""}`}
          >
            <p className="gate-kicker">Thickness compliance</p>
            <h3>t_nom at or above t_min, and MAOP at or above design pressure</h3>
            <p className="gate-status">
              {result
                ? formatCompliance(result.isCompliant)
                : "Awaiting inputs"}
            </p>
            {ready && result && !result.isCompliant ? (
              <p>
                Selected {formatFixed(ready.tnom, thicknessDigits)}{" "}
                {units.thickness} is below the {formatFixed(result.tMin, thicknessDigits)}{" "}
                {units.thickness} minimum, or MAOP of{" "}
                {formatFixed(result.maop, pressureDigits)} {units.pressure} is
                below the {formatFixed(ready.pDesign, pressureDigits)}{" "}
                {units.pressure} design pressure.
              </p>
            ) : null}
            {ready && result && result.isCompliant ? (
              <p>
                Selected {formatFixed(ready.tnom, thicknessDigits)} {units.thickness}{" "}
                nominal wall is at or above t_min and supports{" "}
                {formatFixed(result.maop, pressureDigits)} {units.pressure}.
              </p>
            ) : null}
          </article>
          <article
            className={`gate ${result ? (slendernessOk ? "is-pass" : "is-fail") : ""}`}
          >
            <p className="gate-kicker">Slenderness D/t</p>
            <h3>D/t_nom and D/t_min at or below {SLENDERNESS_LIMIT}</h3>
            <p className="gate-status">
              {result ? slendernessLabel(slendernessOk) : "Awaiting inputs"}
            </p>
            {result ? (
              <p>
                D/t_nom is {formatFixed(result.dtNom, 1)} (
                {slendernessLabel(result.dtNomOk)}). D/t_min is{" "}
                {formatFixed(result.dtMin, 1)} ({slendernessLabel(result.dtMinOk)}
                ).
              </p>
            ) : null}
          </article>
        </div>
      </section>

      <section className="panel" aria-labelledby="compare-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 4</p>
          <h2 id="compare-heading">Multi-standard comparison</h2>
        </div>
        <p className="field-hint compare-intro">
          Side-by-side encoded design-factor checks for the same inputs. The
          primary code still drives the results panel above. Scroll sideways on
          a narrow screen.
        </p>
        {comparison.length > 0 ? (
          <ComparisonGrid
            rows={comparison}
            selectedCode={code}
            unitSystem={unitSystem}
          />
        ) : (
          <p className="field-hint">Enter valid numbers to fill the grid.</p>
        )}
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
