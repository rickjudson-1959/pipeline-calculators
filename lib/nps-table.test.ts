import assert from "node:assert/strict";
import { test } from "node:test";
import { filterNpsTable, findNpsRow, NPS_OD_TABLE } from "./nps-table.ts";

test("known NPS sizes match published ASME B36.10/B36.19 outside diameters", () => {
  assert.equal(findNpsRow("1/2")?.odIn, 0.84);
  assert.equal(findNpsRow("1/2")?.odMm, 21.3);
  assert.equal(findNpsRow("2")?.odIn, 2.375);
  assert.equal(findNpsRow("2")?.odMm, 60.3);
  assert.equal(findNpsRow("6")?.odIn, 6.625);
  assert.equal(findNpsRow("6")?.odMm, 168.3);
  assert.equal(findNpsRow("12")?.odIn, 12.75);
  assert.equal(findNpsRow("12")?.odMm, 323.9);
});

test("the suite's own 508 mm default example is exactly NPS 20", () => {
  const row = findNpsRow("20");
  assert.ok(row);
  assert.equal(row?.odMm, 508.0);
});

test("for NPS 14 and above, OD in inches equals the NPS number", () => {
  const largeSizes = NPS_OD_TABLE.filter((row) => Number(row.nps) >= 14);
  assert.ok(largeSizes.length > 0);
  for (const row of largeSizes) {
    assert.equal(row.odIn, Number(row.nps));
  }
});

test("odMm is odIn times 25.4, rounded to one decimal, for every row", () => {
  for (const row of NPS_OD_TABLE) {
    const exact = row.odIn * 25.4;
    assert.ok(
      Math.abs(row.odMm - exact) <= 0.05001,
      `${row.nps}: exact conversion is ${exact} mm, table has ${row.odMm} mm`,
    );
  }
});

test("OD strictly increases as NPS size increases down the table", () => {
  for (let i = 1; i < NPS_OD_TABLE.length; i += 1) {
    assert.ok(
      NPS_OD_TABLE[i].odIn > NPS_OD_TABLE[i - 1].odIn,
      `${NPS_OD_TABLE[i].nps} OD should exceed ${NPS_OD_TABLE[i - 1].nps} OD`,
    );
  }
});

test("filterNpsTable returns the full table on an empty query", () => {
  assert.equal(filterNpsTable("").length, NPS_OD_TABLE.length);
  assert.equal(filterNpsTable("   ").length, NPS_OD_TABLE.length);
});

test("filterNpsTable matches by NPS label or OD value", () => {
  const byNps = filterNpsTable("1-1/2");
  assert.equal(byNps.length, 1);
  assert.equal(byNps[0].nps, "1-1/2");

  const byOd = filterNpsTable("508");
  assert.equal(byOd.length, 1);
  assert.equal(byOd[0].nps, "20");

  const none = filterNpsTable("not-a-size");
  assert.equal(none.length, 0);
});
