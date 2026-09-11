"use client";

import { useMemo, useState } from "react";
import {
  calculateHydrostatic,
  DEFAULT_HYDRO_INPUTS,
  formatFixed,
  HIGH_POINT_MOP_FACTOR,
  parseNumericInput,
  validateHydroInputs,
  type HydroInputs,
} from "@/lib/hydrostatic";

type FieldKey = keyof HydroInputs;

type FieldConfig = {
  key: FieldKey;
  id: string;
  label: string;
  unit: string;
};

const PIPE_FIELDS: FieldConfig[] = [
  { key: "od", id: "od", label: "Outside diameter", unit: "mm" },
  { key: "wt", id: "wt", label: "Wall thickness", unit: "mm" },
  { key: "smys", id: "smys", label: "SMYS", unit: "MPa" },
  { key: "length", id: "length", label: "Section length", unit: "m" },
  { key: "mop", id: "mop", label: "Licensed MOP", unit: "kPa" },
  { key: "pTarget", id: "p-target", label: "Target test pressure", unit: "kPa" },
];

const ELEVATION_FIELDS: FieldConfig[] = [
  { key: "elHigh", id: "el-high", label: "High-point elevation", unit: "m" },
  { key: "elTest", id: "el-test", label: "Test-point elevation", unit: "m" },
  { key: "elLow", id: "el-low", label: "Low-point elevation", unit: "m" },
];

function defaultFieldState(): Record<FieldKey, string> {
  return {
    od: String(DEFAULT_HYDRO_INPUTS.od),
    wt: String(DEFAULT_HYDRO_INPUTS.wt),
    smys: String(DEFAULT_HYDRO_INPUTS.smys),
    length: String(DEFAULT_HYDRO_INPUTS.length),
    mop: String(DEFAULT_HYDRO_INPUTS.mop),
    pTarget: String(DEFAULT_HYDRO_INPUTS.pTarget),
    elHigh: String(DEFAULT_HYDRO_INPUTS.elHigh),
    elTest: String(DEFAULT_HYDRO_INPUTS.elTest),
    elLow: String(DEFAULT_HYDRO_INPUTS.elLow),
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

function ElevationProfile({
  elHigh,
  elTest,
  elLow,
}: {
  elHigh: number;
  elTest: number;
  elLow: number;
}) {
  const points = [
    { x: 40, label: "High", value: elHigh },
    { x: 200, label: "Test", value: elTest },
    { x: 360, label: "Low", value: elLow },
  ];
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const plotted = points.map((point) => ({
    ...point,
    y: 88 - ((point.value - min) / span) * 52,
  }));
  const path = plotted
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <figure className="elevation-figure">
      <svg
        viewBox="0 0 400 130"
        role="img"
        aria-label={`Elevation sketch. High ${elHigh} metres, test ${elTest} metres, low ${elLow} metres.`}
      >
        <line x1="24" y1="20" x2="24" y2="100" stroke="#c5d0dc" strokeWidth="1" />
        <line x1="24" y1="100" x2="384" y2="100" stroke="#c5d0dc" strokeWidth="1" />
        <path d={path} fill="none" stroke="#1f497d" strokeWidth="3" />
        {plotted.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#2e75b6" />
            <text x={point.x} y="118" textAnchor="middle" fill="#5a6a7a" fontSize="12">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Hydrostatic head uses 9.81 kPa per metre between the test point and each
        elevation.
      </figcaption>
    </figure>
  );
}

export function HydrostaticCalculator() {
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
          od: parsed.od,
          wt: parsed.wt,
          smys: parsed.smys,
          length: parsed.length,
          mop: parsed.mop,
          pTarget: parsed.pTarget,
          elHigh: parsed.elHigh,
          elTest: parsed.elTest,
          elLow: parsed.elLow,
        } as HydroInputs)
      : null;

  const errors = ready ? validateHydroInputs(ready) : ["Enter a number in every field."];
  const result = ready && errors.length === 0 ? calculateHydrostatic(ready) : null;

  function updateField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="calculator">
      <div className="calculator-toolbar">
        <p className="live-note">Results update as you type.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setFields(defaultFieldState())}>
          Reset defaults
        </button>
      </div>

      <section className="panel" aria-labelledby="pipe-params-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="pipe-params-heading">Pipe &amp; Test Parameters</h2>
        </div>
        <div className="field-grid">
          {PIPE_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={fields[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="elevation-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="elevation-heading">Elevation</h2>
        </div>
        <div className="field-grid">
          {ELEVATION_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={fields[field.key]}
              onChange={(value) => updateField(field.key, value)}
            />
          ))}
        </div>
        {ready && errors.length === 0 ? (
          <ElevationProfile
            elHigh={ready.elHigh}
            elTest={ready.elTest}
            elLow={ready.elLow}
          />
        ) : null}
      </section>

      <section className="panel" aria-labelledby="fill-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 3</p>
          <h2 id="fill-heading">Fill Volume</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="Inside diameter"
            value={result ? `${formatFixed(result.id, 1)} mm` : "--"}
            hint="OD minus two wall thicknesses"
          />
          <ResultStat
            label="CUBES"
            value={result ? `${formatFixed(result.cubes, 3)} m3` : "--"}
            hint="Internal area times section length"
          />
          <ResultStat
            label="Barrels"
            value={result ? formatFixed(result.bbls, 2) : "--"}
            hint="CUBES x 6.28981"
          />
          <ResultStat
            label="Bleach"
            value={result ? `${formatFixed(result.bleach, 2)} L` : "--"}
            hint="1 L per cubic metre"
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="stress-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 4</p>
          <h2 id="stress-heading">Stress &amp; Compliance</h2>
        </div>
        <div className="result-grid" aria-live="polite">
          <ResultStat
            label="100% SMYS yield pressure"
            value={result ? `${formatFixed(result.pYield, 1)} kPa` : "--"}
            hint="Barlow. SMYS in MPa converted to kPa."
          />
          <ResultStat
            label="High-point pressure"
            value={result ? `${formatFixed(result.pHigh, 1)} kPa` : "--"}
            hint="Target plus head from test point to high point"
          />
          <ResultStat
            label="Low-point pressure"
            value={result ? `${formatFixed(result.pLow, 1)} kPa` : "--"}
            hint="Target plus head from test point to low point"
          />
          <ResultStat
            label="1.25 x licensed MOP"
            value={result ? `${formatFixed(result.minPHigh, 1)} kPa` : "--"}
            hint="Minimum high-point gate used by this tool"
          />
        </div>

        <div className="gate-grid">
          <article className={`gate ${result ? (result.isHighOk ? "is-pass" : "is-fail") : ""}`}>
            <p className="gate-kicker">High-point gate</p>
            <h3>High-point pressure at or above 1.25 x MOP</h3>
            <p className="gate-status">
              {result ? (result.isHighOk ? "Meets gate" : "Does not meet gate") : "Awaiting inputs"}
            </p>
            {result && !result.isHighOk ? (
              <p>
                High-point pressure is {formatFixed(result.minPHigh - result.pHigh, 1)} kPa
                below {HIGH_POINT_MOP_FACTOR.toFixed(2)} x MOP.
              </p>
            ) : null}
          </article>
          <article className={`gate ${result ? (result.isLowOk ? "is-pass" : "is-fail") : ""}`}>
            <p className="gate-kicker">Low-point gate</p>
            <h3>Low-point pressure at or below 100% SMYS</h3>
            <p className="gate-status">
              {result ? (result.isLowOk ? "Meets gate" : "Does not meet gate") : "Awaiting inputs"}
            </p>
            {result && !result.isLowOk ? (
              <p>
                Low-point pressure is {formatFixed(result.pLow - result.pYield, 1)} kPa
                above 100% SMYS yield.
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
