import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_MODE,
  modeFieldConfig,
  modeHeadlineLabel,
} from "./b314-wall-maop.ts";
import { calculateWallThickness, DEFAULT_WALL_INPUTS } from "./wall-thickness.ts";

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
