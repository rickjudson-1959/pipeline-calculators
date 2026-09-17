# Contributing

## UI versus engineering math

Engineering math lives only in isolated modules under `lib/`. Each calculator implements the cited formulas in that module. Presentation code under `components/` and `app/` may parse inputs, call the math module, and render results. It must not embed or re-derive formulas.

Visual or styling changes must not require math changes. Formula changes must be covered by unit and fixture tests in `lib/*.test.ts` for every formula path. `npm test` and `npm run verify` are the check for encoded math.

On-page citation and disclaimer copy may name the reference and describe what the tool reports. They are not a second implementation of the equations.

This split is the Rick lock for this repo: UI and styling are free to change; the cited engineering math is not.

## Adding a calculator

1. Put formulas, validation, defaults, and citation strings in a new `lib/<name>.ts` module.
2. Add `lib/<name>.test.ts` that covers every formula path and input gate.
3. Add a `scripts/verify-<name>.ts` printout if the suite already uses verify scripts.
4. Wire a client component that only calls the module, plus a `/calculators/<slug>` page that matches existing chrome, SEO metadata, and disclaimer wording.
5. List the tool on Home via `lib/calculators.ts`. Keep sibling calculator links hidden on tool pages (`app/calculators/layout.tsx` already sets `showSuiteNav={false}`).
6. Keep the tool free: no login and no paywall.

Do not use em dashes in new user-facing copy.
