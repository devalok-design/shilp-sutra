# ui/data-table-toolbar — finish-bar audit

Finish: 3/5   Market: LAGS (MUI DataGrid / Carbon TableToolbar)   Rebuild: polish (substantial)

Companion control-strip for `DataTable` (global search + column-visibility menu + density cycle-button + CSV export). Rendered internally via `DataTable toolbar={true}`; also exported barrel-isolated. Utility-ish, but user-facing enough to score all applicable axes.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Tokens clean (`gap-ds-03`, `pb-ds-04`, `gap-ds-02`, `h-ds-sm`); no edge-soup, no radius-ds, no slop. BUT search is a bare transparent `<input>` with no field affordance (no border/bg/rounded) — reads as a floating icon+text, not a searchable field. Three `variant="outline" color="neutral"` buttons violate the repo soft-over-outline default for non-primary actions. |
| accessibility | ✗ | Search input sets `outline-hidden` and adds **no** replacement focus ring → WCAG 2.4.7 Focus Visible failure (keyboard users lose the search field). `size="sm"` buttons + 32px (`h-ds-sm`) input are below the 44px `touch-target` bar. Column menu (Radix DropdownMenu) and button aria-labels are correct; density button has a good aria-label. |
| api-composability | ✗ | No `forwardRef` (DS wraps refs everywhere; this is a bare `<div {...props}>`). **No actions/children slot** — the one place a consumer wants custom toolbar buttons, there's no way in. Export is baked to CSV + hardcoded `table-export.csv` filename; `enableExport` toggles it but you can't customize format/filename. `globalFilterValue`/`onGlobalFilterChange` are required even when `globalFilter={false}`. Density is a blind cycle-button, not a canonical `value`/`onValueChange` selector. |
| docs-dx | ✓ | Doc exists and matches source (props/defaults/example/composability/gotchas). Minor: doesn't warn that `globalFilterValue` is required regardless of `globalFilter`. |
| testing | ✗ | **No `data-table-toolbar.test.tsx` at all.** Zero unit/RTL/`vitest-axe` coverage. Stories exist (via DataTable) but no axe play test. |
| motion | N/A | No entrance/exit motion — appropriate for a persistent toolbar. Press feedback inherited from Button. Nothing to animate; not penalized. |
| state-coverage | gap | Hover/active/focus inherited from Button; column menu hides when 0 toggleable columns (good). Missing: search focus ring (removed), a clear (×) affordance, export loading/disabled state, and any "no results" surface. |
| content-resilience | gap | Column menu is fixed `w-40` — long headers will clip with no truncation. No wrap/overflow strategy: search + 3 text buttons can overrun a narrow container. `ml-auto` is a physical margin (not `ms-auto`) → not RTL-correct. Header fallback to `col.id` is sensible. |
| theming-resilience | ✓ | All semantic tokens (`text-surface-fg-subtle`, `text-surface-fg`, `bg-transparent`). Survives accent-9 swap; no radius to break `[data-shape]`; fine in light and dark. |
| system-cohesion | gap | Composes Button/Icon/DropdownMenu well, but **re-rolls a raw `<input>`** instead of the DS Input/search field — the composition-duplication anti-pattern (StatCard/Card drift family). Density cycle-button is bespoke where SegmentedControl exists. |
| craft | ✓ | CSV escaping is genuinely careful (quotes/commas/newlines RFC-style, `""` doubling), and it filters the `_select` column out of both headers and rows. Missing polish: no UTF-8 BOM (Excel mojibake risk), no clear button, filename not customizable. |
| perceived-performance | gap | `onGlobalFilterChange` fires every keystroke with no debounce → parent re-filters the whole table per keypress (janks on large data). Export builds the full CSV string synchronously on the main thread with no progress/feedback — freezes on large tables. |
| market-benchmark | ✗ | LAGS MUI DataGrid & Carbon: they ship debounced quick-filter WITH a clear button in a bordered field, a discoverable density MENU (3 labeled options), an export MENU (CSV/print/clipboard, custom filename), and a contextual batch-action bar on row selection. We have none of those and a focus-ring regression on top. |
| cross-DS-adoption | note | See ideas below. |

## Top gaps (prioritized)
- [P0] accessibility — `outline-hidden` on the search input with no replacement ring is a Focus Visible failure → add `focus-visible:focus-ring` (or route through the DS Input) and give the field a visible container.
- [P1] testing — no test file exists → add RTL + `vitest-axe`: search filter change, column toggle, density cycle, export click, and an axe pass.
- [P1] api-composability — add an `actions`/children slot for consumer toolbar buttons; add `forwardRef`; make `globalFilterValue`/`onGlobalFilterChange` optional when `globalFilter` is off; expose export filename/format.
- [P1] system-cohesion — replace the raw `<input>` with the DS input/search primitive; move density to SegmentedControl or a menu with `value`/`onValueChange`.
- [P2] perceived-performance — debounce global filter; move/guard synchronous CSV build for large row counts.
- [P2] content-resilience — `ml-auto`→`ms-auto`, truncate/auto-size the column menu, add a wrap/overflow strategy for narrow widths.
- [P2] visual-integrity — switch neutral toolbar buttons to `soft` per repo default; give search a real field affordance.

## What it does well
- CSV export escaping is correct and thoughtfully excludes the `_select` column — a real craft detail most toolbars get wrong.
- Clean, cadence-correct spacing and semantic tokens throughout; no slop, no radius-ds, no magic numbers, no edge-soup.
- Column-visibility menu composes Radix DropdownMenu properly (keyboard + ARIA for free) and hides itself when nothing is hideable.
- Density button carries a descriptive aria-label + title, so even as a cycle-button it announces state.

## Cross-DS adoption ideas
- **MUI DataGrid**: debounced quick-filter inside a bordered field with a trailing clear (×) button and a leading search adornment — adopt the debounce + clear.
- **Carbon TableToolbar**: a contextual batch-action bar that slides in when rows are selected ("N selected" + bulk actions). We only surface selection count in a story, never in the toolbar.
- **MUI**: density as a menu of three labeled+iconed radio options (discoverable) instead of a blind cycle — or lean on our own SegmentedControl.
- **MUI/Carbon**: export as a menu (CSV / print / clipboard) with a customizable filename, and async export with progress for large datasets.
- **All**: a first-class `actions` slot so product teams can drop in domain buttons without re-implementing the toolbar.

## Rebuild note
Polish, not a teardown — the layout (search left, controls right) is sound. Scope: (1) restore a visible focus ring and give search a real field container (ideally the DS input primitive); (2) add the missing test file with an axe pass; (3) add `forwardRef` + an `actions` slot + optional filter props + customizable export; (4) convert density to a canonical `value`/`onValueChange` selector; (5) debounce filtering and make the CSV build safe for large tables. No structural rewrite needed, but this is a meaty polish pass touching the API surface, so stage the density/filter-prop changes as deprecated aliases to avoid a hard break.
