"use client";

import { useMemo, useState } from "react";
import {
  calculatePipeVolume,
  DEFAULT_FLUID_PRESET,
  DEFAULT_VOLUME_INPUTS,
  densityFromPreset,
  FLUID_PRESETS,
  formatFixed,
  isFluidPreset,
  parseNumericInput,
  validateVolumeInputs,
  type FluidPreset,
  type PipeVolumeInputs,
} from "@/lib/pipe-volume";
import {
  convertVolumeField,
  formatInputNumber,
  volumeUnitLabels,
  type UnitSystem,
  type VolumeUnitField,
} from "@/lib/units";

type FieldKey = keyof PipeVolumeInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
};

const FIELD_KEYS: FieldKey[] = ["od", "wt", "length", "density", "rate", "dosing"];

function pipeFields(unitSystem: UnitSystem): FieldConfig[] {
  const units = volumeUnitLabels(unitSystem);
  return [
    { key: "od", id: "od", label: "Outside diameter", unit: units.diameter },
    { key: "wt", id: "wt", label: "Wall thickness", unit: units.diameter },
    { key: "length", id: "length", label: "Section length", unit: units.length },
    { key: "density", id: "density", label: "Fluid density", unit: units.density },
    { key: "rate", id: "rate", label: "Pumping rate", unit: units.rate },
    {
      key: "dosing",
      id: "dosing",
      label: "Chemical inhibitor dosing",
      unit: units.dosing,
    },
  ];
}

function defaultFieldState(): Record<FieldKey, string> {
  return {
    od: String(DEFAULT_VOLUME_INPUTS.od),
    wt: String(DEFAULT_VOLUME_INPUTS.wt),
    length: String(DEFAULT_VOLUME_INPUTS.length),
    density: String(DEFAULT_VOLUME_INPUTS.density),
    rate: String(DEFAULT_VOLUME_INPUTS.rate),
    dosing: String(DEFAULT_VOLUME_INPUTS.dosing),
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
    next[key] = formatInputNumber(convertVolumeField(key as VolumeUnitField, parsed, from, to));
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

export function PipeVolumeCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [fluidPreset, setFluidPreset] = useState<FluidPreset>(DEFAULT_FLUID_PRESET);
  const [fields, setFields] = useState(defaultFieldState);
  const units = volumeUnitLabels(unitSystem);

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
          length: parsed.length,
          density: parsed.density,
          rate: parsed.rate,
          dosing: parsed.dosing,
        } as PipeVolumeInputs)
      : null;

  const errors = ready ? validateVolumeInputs(ready) : ["Enter a number in every field."];
  const result =
    ready && errors.length === 0
      ? calculatePipeVolume(ready, { unitSystem })
      : null;
  const idDigits = unitSystem === "metric" ? 1 : 3;
  const massLabel = unitSystem === "metric" ? "Fluid fill mass" : "Fluid fill weight";

  function updateField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    if (key === "density") {
      setFluidPreset("custom");
    }
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) {
      return;
    }
    setFields((current) => convertFieldState(current, unitSystem, next));
    setUnitSystem(next);
  }

  function changeFluidPreset(next: FluidPreset) {
    setFluidPreset(next);
    if (next === "custom") {
      return;
    }
    setFields((current) => ({
      ...current,
      density: formatInputNumber(densityFromPreset(next, unitSystem)),
    }));
  }

  function resetDefaults() {
    setUnitSystem("metric");
    setFluidPreset(DEFAULT_FLUID_PRESET);
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
          <h2 id="setup-heading">Units &amp; Fluid</h2>
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
              Switching units converts the numbers already in the form. Chemical
              dosing stays in ppm.
            </p>
          </div>
          <div className="field">
            <label htmlFor="fluid-preset">Fluid preset</label>
            <div className="field-control">
              <select
                id="fluid-preset"
                name="fluid-preset"
                value={fluidPreset}
                onChange={(event) => {
                  if (isFluidPreset(event.target.value)) {
                    changeFluidPreset(event.target.value);
                  }
                }}
              >
                {FLUID_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="field-hint">
              Sets fluid density from specific gravity. Choose custom to type a
              density.
            </p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="pipe-params-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="pipe-params-heading">Pipe &amp; Fluid Parameters</h2>
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
          <h2 id="results-heading">Volume &amp; Displacement</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Inside diameter"
            value={result ? `${formatFixed(result.id, idDigits)} ${units.diameter}` : "--"}
            hint="OD minus two wall thicknesses"
          />
          <ResultStat
            label="Line fill volume"
            value={result ? `${formatFixed(result.fillVolume, 1)} ${units.volume}` : "--"}
            hint={
              unitSystem === "metric"
                ? "Internal area times section length"
                : "Internal area (ft2) times length, divided by 5.61458"
            }
          />
          <ResultStat
            label="Volume per distance"
            value={
              result
                ? `${formatFixed(result.volumePerDistance, 1)} ${units.gradient}`
                : "--"
            }
            hint={
              unitSystem === "metric"
                ? "Line fill volume divided by length in kilometres"
                : "Barrel volume divided by length in miles"
            }
          />
          <ResultStat
            label={massLabel}
            value={result ? `${formatFixed(result.fillMass, 1)} ${units.mass}` : "--"}
            hint={
              unitSystem === "metric"
                ? "Fill volume times density, shown in tonnes"
                : "Cubic-foot volume times density, shown in pounds"
            }
          />
          <ResultStat
            label="Fill / displacement time"
            value={
              result ? `${formatFixed(result.fillTimeHours, 2)} ${units.time}` : "--"
            }
            hint={
              unitSystem === "metric"
                ? "Fill volume divided by pumping rate. Zero if rate is 0."
                : "Barrel volume divided by pumping rate. Zero if rate is 0."
            }
          />
          <ResultStat
            label="Chemical dosage"
            value={
              result ? `${formatFixed(result.chemicalDose, 1)} ${units.chemical}` : "--"
            }
            hint={
              unitSystem === "metric"
                ? "Fill volume times dosing ppm / 1000, shown in litres"
                : "Metric litre dose converted at 0.264172 gallons per litre"
            }
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
