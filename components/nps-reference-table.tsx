"use client";

import { useMemo, useState } from "react";
import { filterNpsTable } from "@/lib/nps-table";

function formatOdIn(value: number): string {
  return value.toLocaleString("en-CA", {
    minimumFractionDigits: value % 1 === 0 ? 1 : 3,
    maximumFractionDigits: 3,
  });
}

function formatOdMm(value: number): string {
  return value.toLocaleString("en-CA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function NpsReferenceTable() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => filterNpsTable(query), [query]);

  return (
    <div className="calculator">
      <section className="panel" aria-labelledby="filter-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 1</p>
          <h2 id="filter-heading">Find a size</h2>
        </div>
        <div className="field">
          <label htmlFor="nps-filter">Filter by NPS or OD</label>
          <div className="field-control">
            <input
              id="nps-filter"
              name="nps-filter"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. 20, 508, or 1-1/2"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="field-hint">
            Matches against the NPS label or either OD column. Clear the box
            to see the full table.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="nps-table-heading">
        <div className="panel-head">
          <p className="panel-kicker">Section 2</p>
          <h2 id="nps-table-heading">NPS to true outside diameter</h2>
        </div>
        {rows.length > 0 ? (
          <div className="compare-wrap">
            <table className="compare-table">
              <caption>
                Outside diameter is fixed per NPS regardless of schedule or
                wall thickness. ASME B36.10 / B36.19 nominal pipe sizes, 1/8
                inch through 60 inch.
              </caption>
              <thead>
                <tr>
                  <th scope="col">NPS</th>
                  <th scope="col">OD (in)</th>
                  <th scope="col">OD (mm)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.nps}>
                    <th scope="row">{row.nps}</th>
                    <td>{formatOdIn(row.odIn)}</td>
                    <td>{formatOdMm(row.odMm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="field-hint">No NPS size matches that filter.</p>
        )}
      </section>
    </div>
  );
}
