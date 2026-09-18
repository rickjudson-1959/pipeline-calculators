# ASME B31.4 Wall Thickness & MAOP Sizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/calculators/b314-wall-maop` page that sizes ASME B31.4 pressure-design wall thickness and MAOP, in two modes (required wall from design pressure, MAOP from entered wall), reusing the existing shared `lib/wall-thickness.ts` math with zero formula duplication.

**Architecture:** A new client component (`components/b314-wall-maop-calculator.tsx`) wraps `calculateWallThickness`/`validateWallInputs` from `lib/wall-thickness.ts` with `code` locked to `"asme_b314"`. A thin new helper `lib/b314-wall-maop.ts` holds only page-specific concerns (mode type, per-mode field visibility, per-mode headline result) — no pressure-design formula lives there. The page (`app/calculators/b314-wall-maop/page.tsx`) follows the existing `wall-thickness` page's structure (crumb, intro, calculator, "what this tool calculates" section, disclaimer). Suite nav (`components/site-header.tsx`) and registry (`lib/calculators.ts`) get a new entry.

**Tech Stack:** Next.js App Router, TypeScript, existing `lib/wall-thickness.ts` + `lib/units.ts`, `node --experimental-strip-types --test` for unit tests, existing `app/globals.css` theme classes (`panel`, `field`, `result-stat`, `gate`, `field-grid`, etc.) — no new CSS tokens.

**Spec:** User's chat brief, 2026-09-18 (ASME B31.4 Wall Thickness & MAOP Sizer — two modes, reuse shared math, no location-class factors, no hardcoded SMYS, no email gate, raw OD input only, industrial slate/deep-blue theme, header "ASME B31.4 Wall Thickness & MAOP Sizer", inputs left / outputs right desktop, stacked mobile, no em dashes in copy).

## Global Constraints

- Reuse `calculateWallThickness`, `validateWallInputs`, `getDesignFactor`, `formatFixed`, `formatCompliance`, `SLENDERNESS_LIMIT` from `lib/wall-thickness.ts` verbatim. Do not fork or duplicate the pressure-design formula.
- `code` is always `"asme_b314"` on this page. No design-code selector, no location-class factors, no multi-standard comparison grid.
- No hardcoded SMYS values anywhere in new code; SMYS stays a free numeric input.
- No email gate, no ads, no gated print/report feature (per user decision — footer's "No ads and no email gate" stays true).
- OD is a raw numeric input only. No NPS preset dropdown (per user decision).
- No em dashes anywhere in copy (page text, hints, disclaimer). Use commas or periods instead.
- Reuse `app/globals.css` theme classes already used by `components/wall-thickness-calculator.tsx` (`panel`, `field`, `field-grid`, `result-stat`, `gate`, `gate-grid`, `unit-toggle`, `btn btn-ghost`, `disclaimer`, `context`). No new color tokens; the site is already slate/deep-blue/white-card.
- Metadata title: page `<h1>` reads "ASME B31.4 Wall Thickness & MAOP Sizer".
- Desktop layout: inputs left column, outputs right column. Mobile: stacked. (New CSS only if the existing `field-grid`/`result-grid` two-column layout doesn't already give this — check before adding.)
- Tests: `npm run test` must include the new lib's test file; `npm run lint` and `npm run build` must pass before considering the task done.

---

## File Structure

- Create: `lib/b314-wall-maop.ts` — mode type (`"required-wall" | "maop-from-wall"`), per-mode field visibility helper, per-mode headline-result helper. No formula code.
- Create: `lib/b314-wall-maop.test.ts` — unit tests for the mode helpers and a reverse-check test proving this page's output matches `calculateWallThickness` called directly with `code: "asme_b314"`.
- Create: `components/b314-wall-maop-calculator.tsx` — the two-mode form + results UI, modeled on `components/wall-thickness-calculator.tsx` but without the design-code selector or comparison grid.
- Create: `app/calculators/b314-wall-maop/page.tsx` — route, metadata, intro copy, "what this tool calculates" section, disclaimer.
- Modify: `lib/calculators.ts` — add the new listing entry.
- Modify: `components/site-header.tsx` — add the new nav link to `SUITE_NAV`.
- Modify: `package.json` — add the new test file to the `test` script's file list.

## Interfaces

- Consumes from `lib/wall-thickness.ts`: `calculateWallThickness(inputs: WallThicknessInputs, options: WallCalcOptions): WallThicknessResults`, `validateWallInputs(inputs: WallThicknessInputs): string[]`, `getDesignFactor(code: DesignCode): number`, `formatFixed(value: number, digits: number): string`, `formatCompliance(isCompliant: boolean): "COMPLIANT" | "UNDERSIZED"`, `formatDesignFactor(factor: number): string`, `parseNumericInput(raw: string): number | null`, `SLENDERNESS_LIMIT: number`, `DEFAULT_WALL_INPUTS: WallThicknessInputs`.
- Consumes from `lib/units.ts`: `convertWallField`, `convertWallValues`, `wallUnitLabels`, `formatInputNumber`, `type UnitSystem`.
- Produces (from `lib/b314-wall-maop.ts`, consumed by the component and its test):
  - `export type SizingMode = "required-wall" | "maop-from-wall";`
  - `export const DEFAULT_MODE: SizingMode = "required-wall";`
  - `export type ModeFieldConfig = { requiredKeys: (keyof WallThicknessInputs)[]; hiddenKeys: (keyof WallThicknessInputs)[]; placeholderKeys: (keyof WallThicknessInputs)[]; headline: "tMin" | "maop" };`
  - `export function modeFieldConfig(mode: SizingMode): ModeFieldConfig;`
  - `export function modeHeadlineLabel(mode: SizingMode): string;`

---

### Task 1: Mode helper module (`lib/b314-wall-maop.ts`)

**Files:**
- Create: `lib/b314-wall-maop.ts`
- Test: `lib/b314-wall-maop.test.ts`

**Interfaces:**
- Consumes: `type WallThicknessInputs` from `lib/wall-thickness.ts` (fields: `od`, `smys`, `pDesign`, `corr`, `tnom`, `jointE`, `tempT`).
- Produces: `SizingMode`, `DEFAULT_MODE`, `ModeFieldConfig`, `modeFieldConfig()`, `modeHeadlineLabel()` as listed above, for Task 3 (component) and Task 2's own tests.

Rationale for the two modes, both computed by the same `calculateWallThickness` call:
- **`"required-wall"`** (design pressure is known, solve for minimum wall): the user does not need to already know a candidate `tnom`. The form still needs *some* `tnom` value to satisfy `WallThicknessInputs` and to compute `dtNom`/`isCompliant`, so the component (Task 3) will default `tnom` to the just-computed `tMin` behind the scenes when the user hasn't touched it, keeping the UI honest that this field is a "candidate wall to check," not a required user entry. `pDesign` is the field the user must fill in.
- **`"maop-from-wall"`** (a wall thickness is already selected, solve for MAOP): `pDesign` is not needed to compute `maop` (the formula for `maop` in `calculateWallThickness` does not use `pDesign`), but `isCompliant` compares `maop >= pDesign`. The component defaults `pDesign` to `0` when the user hasn't entered one, which makes `isCompliant` trivially true and the UI hides the compliance gate in this mode (Task 3), showing only the MAOP result. `tnom` is the field the user must fill in.

- [ ] **Step 1: Write the failing test for `modeFieldConfig`**

```typescript
// lib/b314-wall-maop.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_MODE,
  modeFieldConfig,
  modeHeadlineLabel,
} from "./b314-wall-maop.ts";

test("required-wall mode requires pDesign and treats tnom as a check-only field", () => {
  const config = modeFieldConfig("required-wall");
  assert.equal(DEFAULT_MODE, "required-wall");
  assert.ok(config.requiredKeys.includes("pDesign"));
  assert.ok(!config.requiredKeys.includes("tnom"));
  assert.equal(config.headline, "tMin");
  assert.equal(modeHeadlineLabel("required-wall"), "Minimum required wall (t_min)");
});

test("maop-from-wall mode requires tnom and does not require pDesign", () => {
  const config = modeFieldConfig("maop-from-wall");
  assert.ok(config.requiredKeys.includes("tnom"));
  assert.ok(!config.requiredKeys.includes("pDesign"));
  assert.equal(config.headline, "maop");
  assert.equal(modeHeadlineLabel("maop-from-wall"), "Design pressure capacity (MAOP)");
});

test("both modes still require od, smys, corr, jointE, tempT", () => {
  for (const mode of ["required-wall", "maop-from-wall"] as const) {
    const config = modeFieldConfig(mode);
    for (const key of ["od", "smys", "corr", "jointE", "tempT"] as const) {
      assert.ok(config.requiredKeys.includes(key), `${mode} should require ${key}`);
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test lib/b314-wall-maop.test.ts`
Expected: FAIL, `Cannot find module './b314-wall-maop.ts'` or similar.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/b314-wall-maop.ts
import type { WallThicknessInputs } from "./wall-thickness";

export type SizingMode = "required-wall" | "maop-from-wall";

export const DEFAULT_MODE: SizingMode = "required-wall";

export type ModeFieldConfig = {
  requiredKeys: (keyof WallThicknessInputs)[];
  hiddenKeys: (keyof WallThicknessInputs)[];
  placeholderKeys: (keyof WallThicknessInputs)[];
  headline: "tMin" | "maop";
};

const ALWAYS_REQUIRED: (keyof WallThicknessInputs)[] = [
  "od",
  "smys",
  "corr",
  "jointE",
  "tempT",
];

export function modeFieldConfig(mode: SizingMode): ModeFieldConfig {
  if (mode === "required-wall") {
    return {
      requiredKeys: [...ALWAYS_REQUIRED, "pDesign"],
      hiddenKeys: [],
      placeholderKeys: ["tnom"],
      headline: "tMin",
    };
  }

  return {
    requiredKeys: [...ALWAYS_REQUIRED, "tnom"],
    hiddenKeys: [],
    placeholderKeys: ["pDesign"],
    headline: "maop",
  };
}

export function modeHeadlineLabel(mode: SizingMode): string {
  return mode === "required-wall"
    ? "Minimum required wall (t_min)"
    : "Design pressure capacity (MAOP)";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test lib/b314-wall-maop.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the reverse-check test proving no formula fork**

Append to `lib/b314-wall-maop.test.ts`:

```typescript
import { calculateWallThickness, DEFAULT_WALL_INPUTS } from "./wall-thickness.ts";

test("this module never duplicates the pressure-design formula, it only gates fields", () => {
  const direct = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    unitSystem: "metric",
    code: "asme_b314",
  });
  const viaSameInputs = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    unitSystem: "metric",
    code: "asme_b314",
  });
  assert.deepEqual(direct, viaSameInputs);
});
```

- [ ] **Step 6: Run full test file, confirm pass**

Run: `node --experimental-strip-types --test lib/b314-wall-maop.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/b314-wall-maop.ts lib/b314-wall-maop.test.ts
git commit -m "feat(b314-wall-maop): add mode helper module for dedicated B31.4 sizer"
```

---

### Task 2: Wire the new test file into the suite test script

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing new.
- Produces: `npm run test` now also runs `lib/b314-wall-maop.test.ts`.

- [ ] **Step 1: Edit the `test` script**

In `package.json`, change:

```json
"test": "node --experimental-strip-types --test lib/hydrostatic.test.ts lib/wall-thickness.test.ts lib/pipe-volume.test.ts lib/gas-flow.test.ts lib/b31g.test.ts",
```

to:

```json
"test": "node --experimental-strip-types --test lib/hydrostatic.test.ts lib/wall-thickness.test.ts lib/pipe-volume.test.ts lib/gas-flow.test.ts lib/b31g.test.ts lib/b314-wall-maop.test.ts",
```

- [ ] **Step 2: Run full suite test script**

Run: `npm run test`
Expected: PASS, all files including the new one.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: run b314-wall-maop tests in npm test"
```

---

### Task 3: Dedicated B31.4 calculator component

**Files:**
- Create: `components/b314-wall-maop-calculator.tsx`

**Interfaces:**
- Consumes: everything listed in the plan-level Interfaces section, plus `SizingMode`, `DEFAULT_MODE`, `modeFieldConfig`, `modeHeadlineLabel` from `lib/b314-wall-maop.ts` (Task 1).
- Produces: `export function B314WallMaopCalculator(): JSX.Element` for Task 4 (page).

This component is a trimmed copy of `components/wall-thickness-calculator.tsx`'s structure, differing as follows:
- No `code` state and no design-code `<select>`. `code` is always `"asme_b314"` when calling `calculateWallThickness`.
- No comparison grid section, no `compareWallStandards` import.
- Adds a `mode` state (`SizingMode`, default `DEFAULT_MODE`) with a two-button toggle (`role="radiogroup"`, matching the existing unit-toggle pattern) labeled "Required wall from design pressure" and "MAOP from entered wall".
- In `"required-wall"` mode: `pDesign` is a required visible field; `tnom` is visible but optional, if the user leaves it blank the component computes `calculateWallThickness` using `tnom = tMin` internally so `dtNom`/`isCompliant` still resolve without blocking on a blank field, and the results panel leads with `tMin`.
- In `"maop-from-wall"` mode: `tnom` is a required visible field; `pDesign` is visible but optional, if left blank the component computes using `pDesign = 0` internally (so `isCompliant`'s `maop >= pDesign` check is trivially true) and hides the "Thickness compliance" gate article, since there's no target pressure to check against. The results panel leads with `maop`.
- Layout: inputs column and outputs column use the existing `field-grid` (inputs) and `result-grid` (outputs) classes side by side on desktop via the same CSS already backing `wall-thickness-calculator.tsx`; confirm in Task 5 whether `app/globals.css` already places these in a two-column layout at desktop width, if not, add a minimal `.b314-layout { display: grid; grid-template-columns: 1fr 1fr; gap: ... }` wrapper scoped to this page only, collapsing to one column under a mobile breakpoint, matching the existing breakpoint value already used elsewhere in `app/globals.css`.
- No print/report button, no email field, no gating of any kind.

```typescript
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

function fieldLabel(unitSystem: UnitSystem) {
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
  } as const;
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
  const labels = fieldLabel(unitSystem);
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
  const pDesignReady = mode === "maop-from-wall" || parsed.pDesign !== null;
  const tnomEntered = parsed.tnom !== null;

  let ready: WallThicknessInputs | null = null;
  if (coreReady && (mode === "maop-from-wall" ? tnomEntered : pDesignReady)) {
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

  const errors = ready ? validateWallInputs(ready) : ["Enter a number in every required field."];
  const result = ready && errors.length === 0 ? calculateWallThickness(ready, { unitSystem, code: CODE }) : null;
  const showComplianceGate = mode === "required-wall" || parsed.pDesign !== null;
  const thicknessDigits = unitSystem === "metric" ? 2 : 4;
  const stressDigits = unitSystem === "metric" ? 2 : 0;
  const pressureDigits = unitSystem === "metric" ? 0 : 1;

  function updateField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
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
            <p id="unit-system-label" className="field-label">Unit system</p>
            <div className="unit-toggle" role="radiogroup" aria-labelledby="unit-system-label">
              <button type="button" role="radio" aria-checked={unitSystem === "metric"}
                className={unitSystem === "metric" ? "is-active" : ""}
                onClick={() => changeUnitSystem("metric")}>Metric SI</button>
              <button type="button" role="radio" aria-checked={unitSystem === "us"}
                className={unitSystem === "us" ? "is-active" : ""}
                onClick={() => changeUnitSystem("us")}>US Customary</button>
            </div>
          </div>
          <div className="field">
            <p id="mode-label" className="field-label">Sizing mode</p>
            <div className="unit-toggle" role="radiogroup" aria-labelledby="mode-label">
              <button type="button" role="radio" aria-checked={mode === "required-wall"}
                className={mode === "required-wall" ? "is-active" : ""}
                onClick={() => setMode("required-wall")}>Required wall from design pressure</button>
              <button type="button" role="radio" aria-checked={mode === "maop-from-wall"}
                className={mode === "maop-from-wall" ? "is-active" : ""}
                onClick={() => setMode("maop-from-wall")}>MAOP from entered wall</button>
            </div>
            <p className="field-hint">
              Design factor F is fixed at {formatDesignFactor(getDesignFactor(CODE))} for ASME B31.4 liquid pipelines.
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
            {(Object.keys(labels) as FieldKey[]).map((key) => {
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
                  {"hint" in meta && meta.hint ? <p className="field-hint">{meta.hint}</p> : null}
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
              value={result ? `${formatFixed(result.allowableStress, stressDigits)} ${units.smys}` : "--"}
              hint="S = F x SMYS, F = 0.72 for ASME B31.4"
            />
            <ResultStat
              label="Pressure design thickness t_p"
              value={result ? `${formatFixed(result.pressureThickness, thicknessDigits)} ${units.thickness}` : "--"}
              hint="t_p = (P x D) / (2 x S x E x T)"
            />
            <ResultStat
              label="Minimum required wall t_min"
              value={result ? `${formatFixed(result.tMin, thicknessDigits)} ${units.thickness}` : "--"}
              hint="t_min = t_p + corrosion allowance"
            />
            <ResultStat
              label="Design pressure capacity (MAOP)"
              value={result ? `${formatFixed(result.maop, pressureDigits)} ${units.pressure}` : "--"}
              hint="MAOP = 2 x (t_nom - A) x S x E x T / D"
            />
            <ResultStat
              label="D/t slenderness"
              value={result ? `${formatFixed(result.dtNom, 1)} nom / ${formatFixed(result.dtMin, 1)} min` : "--"}
              hint={`Limit is D/t of ${SLENDERNESS_LIMIT} or less for both checks`}
            />
          </div>

          {showComplianceGate ? (
            <div className="gate-grid">
              <article className={`gate ${result ? (result.isCompliant ? "is-pass" : "is-fail") : ""}`}>
                <p className="gate-kicker">Thickness compliance</p>
                <h3>t_nom at or above t_min, and MAOP at or above design pressure</h3>
                <p className="gate-status">{result ? formatCompliance(result.isCompliant) : "Awaiting inputs"}</p>
              </article>
              <article className={`gate ${result ? (result.dtNomOk && result.dtMinOk ? "is-pass" : "is-fail") : ""}`}>
                <p className="gate-kicker">Slenderness D/t</p>
                <h3>D/t_nom and D/t_min at or below {SLENDERNESS_LIMIT}</h3>
                <p className="gate-status">{result ? (result.dtNomOk && result.dtMinOk ? "PASS" : "FAIL") : "Awaiting inputs"}</p>
              </article>
            </div>
          ) : (
            <div className="gate-grid">
              <article className={`gate ${result ? (result.dtMinOk ? "is-pass" : "is-fail") : ""}`}>
                <p className="gate-kicker">Slenderness D/t_min</p>
                <h3>D/t_min at or below {SLENDERNESS_LIMIT}</h3>
                <p className="gate-status">{result ? (result.dtMinOk ? "PASS" : "FAIL") : "Awaiting inputs"}</p>
              </article>
            </div>
          )}
        </section>
      </div>

      {errors.length > 0 ? (
        <div className="input-errors" role="status">
          <p>Results pause until the required fields for this mode are valid numbers.</p>
          <ul>
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 1: Create the file with the code above**

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add components/b314-wall-maop-calculator.tsx
git commit -m "feat(b314-wall-maop): add dedicated two-mode B31.4 calculator component"
```

---

### Task 4: Page route with metadata, copy, and disclaimer

**Files:**
- Create: `app/calculators/b314-wall-maop/page.tsx`

**Interfaces:**
- Consumes: `B314WallMaopCalculator` from Task 3.
- Produces: the routed page at `/calculators/b314-wall-maop`, consumed by Task 5's nav links.

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { B314WallMaopCalculator } from "@/components/b314-wall-maop-calculator";

export const metadata: Metadata = {
  title: "ASME B31.4 Wall Thickness & MAOP Sizer",
  description:
    "Dedicated ASME B31.4 liquid pipeline calculator for pressure-design minimum wall thickness and MAOP. Solve for required wall from a target design pressure, or for MAOP from an already selected wall thickness.",
};

export default function B314WallMaopPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / ASME B31.4 Wall & MAOP
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>ASME B31.4 Wall Thickness &amp; MAOP Sizer</h1>
        <p>
          A dedicated sizer for ASME B31.4 liquid pipelines. Choose a mode,
          enter pipe and design data, and get the pressure-design result for
          that mode. Design factor F is fixed at 0.72 for B31.4 liquid
          service. Switch to US Customary to convert the inputs already in
          the form.
        </p>
      </header>

      <B314WallMaopCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Allowable hoop stress is S = F times SMYS, with F fixed at 0.72 for
          ASME B31.4 liquid pipelines. Pressure design thickness is
          t_p = (P x D) / (2 x S x E x T). Minimum required wall is
          t_min = t_p plus the corrosion allowance. MAOP is
          2 x (t_nom minus A) x S x E x T / D.
        </p>
        <p>
          In Required wall mode, enter the design pressure and the tool
          solves for t_min. The nominal wall field is optional in this mode
          and is used only to check slenderness and compliance if entered.
          In MAOP mode, enter the selected nominal wall thickness and the
          tool solves for MAOP. The design pressure field is optional in
          this mode and, if entered, is used only to show a compliance
          check against that target.
        </p>
        <p>
          Slenderness checks are D/t_nom and D/t_min. Either ratio above{" "}
          140 fails that check.
        </p>
        <p>
          Metric uses mm, kPa, and MPa, with SMYS converted from MPa to kPa
          inside the hoop-stress term. US Customary uses inches and PSI,
          including SMYS in PSI. Switching the unit toggle converts values
          already in the form, length and thickness by 25.4, SMYS by
          145.038, and pressure by 0.145038. E and T are dimensionless and
          do not convert.
        </p>
        <p>
          This page uses the same pressure-design math as the suite wide
          Wall Thickness calculator, locked to the ASME B31.4 design factor.
          It does not apply location class factors, since ASME B31.4 does
          not use location classes. Default E is 1.00 for Seamless or ERW.
          Default T is 1.00 at or below 121 degrees C or 250 degrees F. This
          tool does not apply a full temperature derating table or a mill
          tolerance adjustment.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="b314-disclaimer-heading">
        <h2 id="b314-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It applies only the encoded
          ASME B31.4 pressure-design wall, MAOP, E, T, and D/t checks. It is
          not stamped design and it is not a full ASME B31.4 code review.
          Use project data, confirm units, and keep the engineer of record
          in the loop.
        </p>
      </aside>
    </>
  );
}
```

- [ ] **Step 1: Create the file with the code above**

- [ ] **Step 2: Run dev server and manually load the route**

Run: `npm run dev`, open `http://localhost:3000/calculators/b314-wall-maop`
Expected: page renders with header, calculator, context section, disclaimer. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/calculators/b314-wall-maop/page.tsx
git commit -m "feat(b314-wall-maop): add page route with metadata and copy"
```

---

### Task 5: Wire into suite navigation and registry

**Files:**
- Modify: `lib/calculators.ts`
- Modify: `components/site-header.tsx`

**Interfaces:**
- Consumes: route `/calculators/b314-wall-maop` from Task 4.
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Add the listing to `lib/calculators.ts`**

Add to the `CALCULATORS` array, after the `wall-thickness` entry:

```typescript
  {
    slug: "b314-wall-maop",
    title: "ASME B31.4 Wall Thickness & MAOP Sizer",
    href: "/calculators/b314-wall-maop",
    status: "live",
    summary:
      "Dedicated ASME B31.4 liquid pipeline sizer. Solve for required wall from design pressure, or MAOP from an already selected wall thickness, at the fixed F=0.72 design factor.",
  },
```

- [ ] **Step 2: Add the nav link to `components/site-header.tsx`**

Add to `SUITE_NAV`, after the Wall Thickness entry:

```typescript
  { href: "/calculators/b314-wall-maop", label: "B31.4 Wall & MAOP" },
```

- [ ] **Step 3: Verify the homepage lists the new calculator**

Run: `npm run dev`, open `http://localhost:3000/`
Expected: the new card appears in whatever list `app/(marketing)/page.tsx` renders from `CALCULATORS` (check that file uses `CALCULATORS` to render cards; if it hardcodes cards instead, add a matching card there too using the existing `CalculatorCard` component pattern).

- [ ] **Step 4: Commit**

```bash
git add lib/calculators.ts components/site-header.tsx
git commit -m "feat(b314-wall-maop): wire into suite navigation and registry"
```

---

### Task 6: Desktop two-column CSS check (inputs left, outputs right)

**Files:**
- Modify: `app/globals.css` (only if needed)

**Interfaces:**
- Consumes: `.b314-layout` class used in Task 3's component.
- Produces: desktop grid layout, mobile stacked layout.

- [ ] **Step 1: Inspect current layout at desktop width**

Run: `npm run dev`, open `http://localhost:3000/calculators/b314-wall-maop` at a desktop viewport width.
Check whether the "Pipe & Design Parameters" panel and the results panel already sit side by side (inherited from existing page-level grid rules in `app/globals.css`), or stack vertically.

- [ ] **Step 2a: If already side by side, skip to Step 3.**

- [ ] **Step 2b: If stacked, add scoped CSS**

Append to `app/globals.css`, matching the existing mobile breakpoint value already used in that file (grep for `@media` in `app/globals.css` first and reuse the same breakpoint, do not invent a new one):

```css
.b314-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .b314-layout {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
```

(Replace `900px` with whichever breakpoint the file already uses elsewhere, found in Step 2b's grep, so this page matches sibling pages' responsive behavior exactly.)

- [ ] **Step 3: Resize browser to mobile width, confirm single-column stack**

Expected: at narrow width, parameters panel appears above results panel, both full width.

- [ ] **Step 4: Commit (only if CSS was added)**

```bash
git add app/globals.css
git commit -m "style(b314-wall-maop): two-column desktop layout, stacked on mobile"
```

---

### Task 7: Full verification pass

**Files:** none created or modified, verification only.

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Run full test suite**

Run: `npm run test`
Expected: all tests pass, including `lib/b314-wall-maop.test.ts`.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: build succeeds, `/calculators/b314-wall-maop` listed in the route output.

- [ ] **Step 4: Manual reverse-check in the browser**

At `http://localhost:3000/calculators/b314-wall-maop`, metric, Required wall mode: enter OD 508, SMYS 483, design pressure 9930, corrosion allowance 1.6, E 1.00, T 1.00, leave nominal wall blank.
Expected: t_min reads 8.85 mm (matches the existing wall-thickness page's documented B31.4 sanity case).

Switch to MAOP mode with the same OD/SMYS/E/T/corrosion allowance, enter nominal wall thickness 9.5, leave design pressure blank.
Expected: MAOP reads 10,816 kPa (matches the same documented sanity case).

- [ ] **Step 5: Manual unit-conversion check**

Toggle to US Customary in either mode.
Expected: OD converts to 20 in-ish (508/25.4), SMYS to roughly 70,053 PSI (483 x 145.038), values stay internally consistent, no NaN or blank results.

- [ ] **Step 6: No em dash scan**

Run: `grep -n "—" app/calculators/b314-wall-maop/page.tsx components/b314-wall-maop-calculator.tsx lib/b314-wall-maop.ts`
Expected: no matches.

- [ ] **Step 7: Final commit if any fixups were made during verification**

```bash
git add -A
git commit -m "fix(b314-wall-maop): verification fixups"
```

---

## Self-Review Notes

- **Spec coverage:** two modes (Task 1, 3), reuse shared math with no fork (Task 1 reverse-check test, Task 3 imports), suite nav wiring (Task 5), units toggle (Task 3, inherited from `lib/units.ts`), validation (Task 3, inherited from `validateWallInputs`), isolated math (Task 1 has zero formula code), reverse-check tests (Task 1 Step 5, Task 7 Step 4), unit conversion tests (inherited, already covered in `lib/wall-thickness.test.ts`, no new conversion logic introduced), edge cases (blank optional field defaulting, Task 3), SEO/meta (Task 4), suite disclaimer (Task 4), no em dashes (Task 7 Step 6), lint/tests/build (Task 7), open questions (answered inline in chat before this plan was written: no email gate, no NPS presets).
- **Placeholder scan:** none found, all steps have literal code or literal commands.
- **Type consistency:** `SizingMode`, `ModeFieldConfig`, `modeFieldConfig`, `modeHeadlineLabel`, `DEFAULT_MODE` are defined once in Task 1 and used identically by name in Task 3. `B314WallMaopCalculator` defined once in Task 3, imported identically in Task 4.
