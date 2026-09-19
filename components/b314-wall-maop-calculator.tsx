"use client";

import { useMemo, useState } from "react";
import {
  calculateWallThickness,
  formatCompliance,
  formatDesignFactor,
  formatFixed,
  getDesignFactor,
  parseNumericInput,
  SLENDERNESS_LIMIT,
  validateWallInputs,
  type WallThicknessInputs,
} from "@/lib/wall-thickness";
import {
  convertWallField,
  formatInputNumber,
  wallUnitLabels,
  type UnitSystem,
} from "@/lib/units";
import {
  DEFAULT_MODE,
  modeFieldConfig,
  modeHeadlineLabel,
  type SizingMode,
} from "@/lib/b314-wall-maop";

type FieldKey = keyof WallThicknessInputs;

const FIELD_KEYS: FieldKey[] = [
  "od",
  "smys",
  "pDesign",
  "corr",
  "tnom",
  "jointE",
  "tempT",
];

const CODE = "asme_b314" as const;

function defaultFieldState(): Record<FieldKey, string> {
  return {
    od: "508",
    smys: "483",
    pDesign: "9930",
    corr: "1.6",
    tnom: "",
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

type FieldMeta = { label: string; unit: string; hint?: string };

function fieldLabels(unitSystem: UnitSystem): Record<FieldKey, FieldMeta> {
  const units = wallUnitLabels(unitSystem);
  const tempLimit = unitSystem === "metric" ? "121 C" : "250 F";
  return {
    od: { label: "Outside diameter", unit: units.diameter },
    smys: { label: "SMYS", unit: units.smys },
    pDesign: { label: "Design pressure", unit: units.pressure },
    corr: { label: "Corrosion allowance", unit: units.thickness },
    tnom: { label: "Selected nominal wall thickness", unit: units.thickness },
    jointE: {
      label: "Longitudinal joint efficiency E",
      unit: "factor",
      hint: "1.00 for Seamless or ERW. Use a lower value for EFW or lap weld.",
    },
    tempT: {
      label: "Temperature derating factor T",
      unit: "factor",
      hint: `T stays 1.00 at or below ${tempLimit}. This tool does not apply a full temperature table.`,
    },
  };
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

export function B314WallMaopCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [mode, setMode] = useState<SizingMode>(DEFAULT_MODE);
  const [fields, setFields] = useState(defaultFieldState);
  const units = wallUnitLabels(unitSystem);
  const labels = fieldLabels(unitSystem);
  const config = modeFieldConfig(mode);

  const parsed = useMemo(() => {
    const values = {} as Record<FieldKey, number | null>;
    FIELD_KEYS.forEach((key) => {
      values[key] = parseNumericInput(fields[key]);
    });
    return values;
  }, [fields]);

  const coreReady = (["od", "smys", "corr", "jointE", "tempT"] as FieldKey[]).every(
    (key) => parsed[key] !== null,
  );
  const tnomEntered = parsed.tnom !== null;
  const pDesignEntered = parsed.pDesign !== null;
  const modeReady = mode === "maop-from-wall" ? tnomEntered : pDesignEntered;

  let ready: WallThicknessInputs | null = null;
  if (coreReady && modeReady) {
    const base: WallThicknessInputs = {
      od: parsed.od as number,
      smys: parsed.smys as number,
      pDesign: mode === "maop-from-wall" ? (parsed.pDesign ?? 0) : (parsed.pDesign as number),
      corr: parsed.corr as number,
      tnom: parsed.tnom ?? 0,
      jointE: parsed.jointE as number,
      tempT: parsed.tempT as number,
    };

    if (mode === "required-wall" && !tnomEntered) {
      const provisional = calculateWallThickness(
        { ...base, tnom: base.corr + 1 },
        { unitSystem, code: CODE },
      );
      base.tnom = provisional.tMin;
    }

    ready = base;
  }

  const errors = ready
    ? validateWallInputs(ready)
    : ["Enter a number in every required field for this mode."];
  const result =
    ready && errors.length === 0
      ? calculateWallThickness(ready, { unitSystem, code: CODE })
      : null;
  const showComplianceGate = mode === "required-wall" || pDesignEntered;
  const thicknessDigits = unitSystem === "metric" ? 2 : 4;
  const stressDigits = unitSystem === "metric" ? 2 : 0;
  const pressureDigits = unitSystem === "metric" ? 0 : 1;

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
    setMode(DEFAULT_MODE);
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

      <section className="panel" aria-labelledby="mode-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="mode-heading">Units &amp; Sizing Mode</h2>
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
          </div>
          <div className="field">
            <p id="mode-label" className="field-label">
              Sizing mode
            </p>
            <div className="unit-toggle" role="radiogroup" aria-labelledby="mode-label">
              <button
                type="button"
                role="radio"
                aria-checked={mode === "required-wall"}
                className={mode === "required-wall" ? "is-active" : ""}
                onClick={() => setMode("required-wall")}
              >
                Required wall from design pressure
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={mode === "maop-from-wall"}
                className={mode === "maop-from-wall" ? "is-active" : ""}
                onClick={() => setMode("maop-from-wall")}
              >
                MAOP from entered wall
              </button>
            </div>
            <p className="field-hint">
              Design factor F is fixed at {formatDesignFactor(getDesignFactor(CODE))}{" "}
              for ASME B31.4 liquid pipelines.
            </p>
          </div>
        </div>
      </section>

      <div className="b314-layout">
        <section className="panel" aria-labelledby="pipe-params-heading">
          <div className="panel-head">
            <p className="panel-kicker">Section 2</p>
            <h2 id="pipe-params-heading">Pipe &amp; Design Parameters</h2>
          </div>
          <div className="field-grid">
            {FIELD_KEYS.map((key) => {
              const meta = labels[key];
              const isOptional = config.placeholderKeys.includes(key);
              return (
                <div className="field" key={key}>
                  <label htmlFor={key}>
                    {meta.label}
                    {isOptional ? " (optional in this mode)" : ""}
                  </label>
                  <div className="field-control">
                    <input
                      id={key}
                      name={key}
                      inputMode="decimal"
                      autoComplete="off"
                      spellCheck={false}
                      value={fields[key]}
                      placeholder={isOptional ? "Leave blank" : undefined}
                      onChange={(event) => updateField(key, event.target.value)}
                    />
                    <span className="unit">{meta.unit}</span>
                  </div>
                  {meta.hint ? <p className="field-hint">{meta.hint}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel" aria-labelledby="results-heading">
          <div className="panel-head">
            <p className="panel-kicker">Section 3</p>
            <h2 id="results-heading">{modeHeadlineLabel(mode)}</h2>
          </div>
          <div className="result-grid" aria-live="polite">
            <ResultStat
              label="Allowable hoop stress S"
              value={
                result
                  ? `${formatFixed(result.allowableStress, stressDigits)} ${units.smys}`
                  : "--"
              }
              hint="S = F x SMYS, F = 0.72 for ASME B31.4"
            />
            <ResultStat
              label="Pressure design thickness t_p"
              value={
                result && showComplianceGate
                  ? `${formatFixed(result.pressureThickness, thicknessDigits)} ${units.thickness}`
                  : "--"
              }
              hint={
                showComplianceGate
                  ? "t_p = (P x D) / (2 x S x E x T)"
                  : "Not meaningful without a design pressure. Enter one to see this."
              }
            />
            <ResultStat
              label="Minimum required wall t_min"
              value={
                result && showComplianceGate
                  ? `${formatFixed(result.tMin, thicknessDigits)} ${units.thickness}`
                  : "--"
              }
              hint={
                showComplianceGate
                  ? "t_min = t_p + corrosion allowance"
                  : "Not meaningful without a design pressure. Enter one to see this."
              }
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
                  ? showComplianceGate
                    ? `${formatFixed(result.dtNom, 1)} nom / ${formatFixed(result.dtMin, 1)} min`
                    : `${formatFixed(result.dtNom, 1)} nom`
                  : "--"
              }
              hint={
                showComplianceGate
                  ? `Limit is D/t of ${SLENDERNESS_LIMIT} or less for both checks`
                  : `Limit is D/t of ${SLENDERNESS_LIMIT} or less. D/t_min needs a design pressure to be meaningful.`
              }
            />
          </div>

          {showComplianceGate ? (
            <div className="gate-grid">
              <article
                className={`gate ${result ? (result.isCompliant ? "is-pass" : "is-fail") : ""}`}
              >
                <p className="gate-kicker">Thickness compliance</p>
                <h3>t_nom at or above t_min, and MAOP at or above design pressure</h3>
                <p className="gate-status">
                  {result ? formatCompliance(result.isCompliant) : "Awaiting inputs"}
                </p>
              </article>
              <article
                className={`gate ${
                  result ? (result.dtNomOk && result.dtMinOk ? "is-pass" : "is-fail") : ""
                }`}
              >
                <p className="gate-kicker">Slenderness D/t</p>
                <h3>
                  D/t_nom and D/t_min at or below {SLENDERNESS_LIMIT}
                </h3>
                <p className="gate-status">
                  {result
                    ? result.dtNomOk && result.dtMinOk
                      ? "PASS"
                      : "FAIL"
                    : "Awaiting inputs"}
                </p>
              </article>
            </div>
          ) : (
            <div className="gate-grid">
              <article className={`gate ${result ? (result.dtNomOk ? "is-pass" : "is-fail") : ""}`}>
                <p className="gate-kicker">Slenderness D/t_nom</p>
                <h3>D/t_nom at or below {SLENDERNESS_LIMIT}, based on the entered wall</h3>
                <p className="gate-status">
                  {result ? (result.dtNomOk ? "PASS" : "FAIL") : "Awaiting inputs"}
                </p>
              </article>
            </div>
          )}
        </section>
      </div>

      {errors.length > 0 ? (
        <div className="input-errors" role="status">
          <p>Results pause until the required fields for this mode are valid numbers.</p>
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
