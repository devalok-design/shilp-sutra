# ui/data-table-pagination — finish-bar audit

Finish: 2/5   Market: LAGS(MUI DataGrid / Carbon Pagination)   Rebuild: polish

Internal sub-component of DataTable (not exported to consumers). Renders the footer:
total-row count, page-size `<select>`, prev/next icon buttons, "Page X of Y". Props:
`table` (TanStack `Table`), `totalRowCount`, `useServerPagination`, `pageSizeOptions?`.
No dedicated `.stories`/`.test`/baseline finding — covered (if at all) only through `data-table.*`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean role tokens (`rounded-control`, surface/border tokens, `px-ds-03 py-ds-04`, no `rounded-ds-*`, no arbitrary magic). BUT `border border-card-strong` on the `<select>` (line 41) is a **dead class** — no `--color-card-strong` / `card-strong` @utility exists (only `border-card` is defined). The select renders with a `border` width but no color → borderless/invisible edge. Single defect on an otherwise disciplined component. |
| accessibility | ✗ | Prev/next buttons are `h-ds-sm w-ds-sm` = **32×32px**, below the 44px touch-target minimum (no `touch-target` util). No `focus-visible` ring/offset on any control — relies on UA default. Page-change is not announced (no `aria-live` on "Page X of Y"). Positives: `aria-label` on both buttons + select; native `<select>`/`<button>` give free keyboard + mobile semantics. |
| api-composability | gap | Reasonable internal prop surface, but it **re-rolls** a raw `<select>` and two `<button>`s instead of composing DS `Select` + `Button`/`IconButton` — the StatCard/Card composition-drift anti-pattern. No `forwardRef`/`displayName` (acceptable for internal). `pageSizeOptions` typed; no `any`. |
| docs-dx | ✗ | Doc claims it "reads pagination state from DataTableContext" — **source takes `table`/`totalRowCount`/`useServerPagination`/`pageSizeOptions` as direct props**, no context read. Inaccurate. No Props/Types/Defaults table. Changelog stub only. |
| testing | gap | No `data-table-pagination.test.tsx`; no isolated unit/axe coverage for the footer. Any coverage is incidental via DataTable. Page-size change, disabled-edge, server-vs-client branch untested at this level. |
| motion | ✓ | Correctly restrained: `transition-colors` only, no framer. Pagination clicks are high-frequency navigation — NOT animating is the right call. No `slide-no-fade`, no reduced-motion concern. |
| state-coverage | gap | hover (`enabled:hover:bg-surface-raised`) + disabled (`opacity-action-disabled` + `cursor-not-allowed`) designed. Missing: focus-visible, active/pressed, and the `<select>` has zero hover/focus styling. Empty edge: `getPageCount()===0` renders "Page 1 of 0". |
| content-resilience | gap | `{totalRowCount} total rows` is unformatted (no locale/thousands separator → "1000000 total rows") and always plural ("1 total rows"). No RTL mirroring — `IconChevronLeft/Right` are hardcoded, won't flip in RTL (though `px-`/`gap-` are logical in TW4). |
| theming-resilience | gap | Surface tokens + `rounded-control` role token survive brand accent-9 swap and `[data-shape]`. But the dead `border-card-strong` means the select's border is un-themeable/absent. Otherwise light↔dark safe (no sunken track to invert). |
| system-cohesion | ✗ | Bespoke drift: native controls instead of the DS `Button`/`IconButton`/`Select` siblings, no shared `focus-ring` util, and a dead class that a DS-component would never have carried. Does not "feel like one system" with the rest of the footer/toolbar. |
| craft | gap | `cursor-not-allowed` on disabled is a nice touch; but no `cursor-pointer` on enabled controls, no focus ring, unformatted count, plural-blind label. Small unseen-detail misses. |
| perceived-performance | ✓ | Instant, synchronous TanStack state; no layout shift, no jank, no skeleton needed. |
| market-benchmark | ✗ | **LAGS** MUI DataGrid / Carbon Pagination. Offers only prev/next + "Page X of Y" + total. Peers ship a row-range label ("1–10 of 100"), first/last-page buttons, and a page-jump (dropdown or input). Feature-thin for a data-table footer. |
| cross-ds-adoption | gap | Clear, concrete borrow list below — several high-value patterns absent. |

## Top gaps (prioritized)
- [P0] visual-integrity/theming — `border-card-strong` dead class on the `<select>` (line 41) → borderless control. Fix: `border-surface-border-strong` (matches the buttons) or compose DS `Select`.
- [P0] accessibility — 32px prev/next targets + no `focus-visible` ring. Fix: `touch-target` util (44px hit area) + DS `focus-ring`; add `aria-live="polite"` to the page-info span.
- [P1] docs-dx — doc describes a context-read API that doesn't exist. Fix: correct to the real prop surface, add Props/Defaults table.
- [P1] system-cohesion/api — swap raw `<select>`/`<button>` for DS `Select` + `IconButton` to inherit focus ring, sizing, and hover/active for free.
- [P1] market-benchmark — add a row-range label + first/last buttons + page-jump to reach data-grid parity.
- [P2] content-resilience — locale-format `totalRowCount`, pluralize "row(s)", mirror chevrons in RTL.
- [P2] testing — add an isolated test + axe play test (page-size change, disabled edges, server branch).

## What it does well
- Token-disciplined layout: role radius (`rounded-control`), surface/border tokens, on-cadence `ds-03`/`ds-04` spacing, no `rounded-ds-*`/`rounded-full`, no arbitrary `p-[..]` magic.
- Correct motion restraint — no animation on a high-frequency nav control.
- Native `<select>`/`<button>` give solid baseline keyboard + mobile behavior and `aria-label`s are present.
- Cleanly hides the page-size selector under `useServerPagination` (server owns paging).

## Cross-DS adoption ideas
- **MUI `TablePagination`**: "1–10 of 100" range label + `labelDisplayedRows` — far more informative than "Page X of Y". Borrow the range label.
- **Carbon `Pagination`**: page-number dropdown for direct jump + backward/forward with a page `<select>` — add a page-jump so users don't click prev/next N times.
- **MUI DataGrid**: first/last-page buttons flanking prev/next — one-click to the ends.
- **TanStack Table examples**: a "goto page" number input bound to `table.setPageIndex` — cheap power-user affordance.
- **Carbon/MUI**: rows-per-page as a proper styled Select with the DS focus ring (we currently use an unstyled native `<select>` with a dead border).

## Rebuild note
**Polish**, not structural rebuild — the component is small and its layout/token hygiene is sound. Scope: (1) fix the `border-card-strong` dead class → `border-surface-border-strong`; (2) meet a11y bar via `touch-target` (44px) + `focus-ring` + `aria-live` on page info; (3) compose DS `Select` + `IconButton` instead of re-rolling native controls to kill the cohesion drift; (4) correct the inaccurate doc; (5) optionally close the market gap with a row-range label, first/last buttons, and a page-jump. Items 1–4 are the must-do polish; item 5 is the market-parity stretch.
