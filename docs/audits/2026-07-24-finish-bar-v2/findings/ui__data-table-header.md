# ui/data-table-header — finish-bar audit

Finish: 3/5   Market: PARITY (vs MUI DataGrid / Carbon DataTable)   Rebuild: polish

> Internal sub-component (`DataTableHeaderImpl` exported as `DataTableHeader`, not consumer-facing). Renders the `<thead>`: sortable column-header buttons + optional per-column text-filter row. Driven entirely by `DataTableContext` + TanStack `ColumnDef`. No CVA. Audited against the applicable axes; API-surface axis scored in "internal composition" mode.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Sort header is clean (role tokens `rounded-control-inner`, `gap/px/py-ds-01`, `hover:bg-surface-raised-hover`, `-ml-ds-01` optical flush). BUT the filter input uses **`border border-card-strong`** — `border-card-strong` is a **dead class** (only `border-card` exists; no `--color-card-strong` token). Result: `border-width:1px` renders with `border-color` falling back to `currentColor` (dark text color), so every filter input ships a heavier/wrong-colored border instead of the intended subtle card edge. No slop tells (no edge-soup, gradient, glow, emoji, pill-spam). |
| accessibility | gap | Strong core: `aria-sort` on `<th>` (ascending/descending/none), real `<button type="button">` for sort, `aria-label` on both sort button and filter input, keyboard works via native controls. BUT the filter input does `outline-hidden focus:border-accent-7` — **removes the focus outline** and replaces it with only a 1px border-color shift (weak WCAG 2.4.7/2.4.11 focus indication). Sort `<button>` has **no focus-visible ring** at all. Touch targets are sub-44px (sort button `py-ds-01`, filter input `h-ds-xs-plus`=28px) — acceptable for table density but not `touch-target`. |
| api-composability | ✓ | Internal-appropriate. Composes `TableHeader`/`TableRow`/`TableHead` + `Icon` rather than re-rolling; reads state from context; `flexRender` keeps header cells as arbitrary nodes; typed via `DataTableContextValue`. No public prop surface to critique. |
| docs-dx | gap | Doc exists and is honest ("internal only, see DataTable"), with a Changes log. Correctly omits Props/Example since not exported — but it should list **gotchas** (filter row is text-only; sort cycles unsorted→asc→desc; responsive `hideBelow` meta) so DataTable authors know the behaviors. |
| testing | ✗ | **No `data-table*.test.tsx` exists for the entire DataTable family.** Zero unit/RTL/`vitest-axe`/`describeConformance`/interaction coverage for aria-sort transitions, filter wiring, or sticky/pinned classes. Only visual stories (27 exports, sortable/filterable referenced) with **no `play:` interaction test**. |
| motion | gap | Sort-indicator swap uses `AnimatePresence mode="wait" initial={false}` with rotate+opacity and `springs.snappy` — icons **do fade** (initial `opacity:0`), so NOT slide-no-fade; and `initial={false}` correctly suppresses mount animation (craft). BUT **no reduced-motion guard** — `withReducedMotion` exists in the same `lib/motion` and isn't used, so the 90° rotate ignores `prefers-reduced-motion`. `springs.snappy` (stiff 500/damp 30, mass 0.5) is slightly underdamped → minor bounce on a functional toggle (Emil: bounce-free for functional). `mode="wait"` serializes exit-then-enter, adding latency on rapid re-sorts. |
| state-coverage | gap | asc / desc / unsorted all deliberately designed; hover on sort button designed. Missing: focus-visible on sort button; no disabled state for sort/filter; filter input has no clear/reset affordance and no error/invalid state. Empty/error/loading are N/A at header level (owned by DataTable body). |
| content-resilience | gap | `getColumnMetaClasses` gives align + responsive column hiding (`hideBelow sm/md/lg`) and `tabular-nums` — genuinely good. But long header labels have **no truncation strategy** on the sort button (`flex items-center gap` can overflow), and `-ml-ds-01` is a **physical** margin (not logical `-ms-*`) → misaligns under RTL. Sort arrows are vertical so no mirroring needed. |
| theming-resilience | gap | Surface/accent tokens are theme-aware (`bg-surface-raised`, `accent-7`, pinned `bg-surface-base`). But the dead `border-card-strong` means the filter-input border is **not** theme-driven (currentColor), so it won't invert correctly light↔dark. Sticky header comment shows deliberate dark-mode thought (`bg-surface-raised` to avoid a grey stripe). |
| system-cohesion | gap | Shares DS springs, `Icon`, `Table` primitives, `cn`, role/ds tokens with siblings — cohesive. The single drift is the dead `border-card-strong` class (a typo'd/bespoke class that doesn't resolve). |
| craft-unseen | ✓ | Real details: `cursor-pointer select-none` on sort button, `-ml-ds-01` to keep the sorted label optically flush with the column edge, `initial={false}` to skip first-render animation, `tabular-nums` on right-aligned numeric columns, sticky-header surface reasoning documented inline. |
| perceived-performance | ✓ | Sort feedback is instant (native onClick + immediate `aria-sort`); icon slot is always present so no layout shift on sort-state change. Minor ding: `mode="wait"` adds a small icon-swap delay on rapid sorting. No skeleton needed here. |
| market-benchmark | gap | See verdict — PARITY on core sortable+filterable+pinned+responsive header behaviors; polish lags peers on focus visibility and advanced header affordances. |
| cross-DS-adoption | — | Ideas below. |

## Top gaps (prioritized)

- **[P1] visual-integrity / theming — dead `border-card-strong` class** (line 165). Border-color falls back to `currentColor`, shipping a wrong/heavy border on every filter input. → Replace with `border-card` (or `border-surface-border-strong` if a stronger edge is intended). This is a `systemic_flag` seen across the DS.
- **[P1] accessibility — focus indication.** Filter input `outline-hidden focus:border-accent-7` removes the outline for a weak border shift; sort button has no focus-visible ring. → Add `focus-visible:focus-ring` (or the DS focus-ring util) to the sort button and give the filter input a real ring (`focus-visible:ring-2 ring-accent-7 ring-offset-…`), not just a border color change.
- **[P1] testing — zero unit coverage for the DataTable family.** → Add `data-table.test.tsx` with RTL + `vitest-axe` covering aria-sort cycle, filter setFilterValue wiring, sticky/pinned classes, and a stories `play:` test.
- **[P2] motion — no reduced-motion guard.** → Gate the rotate transition through the existing `withReducedMotion` helper / `motion-safe`.
- **[P2] content-resilience / RTL — physical `-ml-ds-01`.** → Use logical `-ms-ds-01`; add truncation for long header labels.
- **[P2] state-coverage — filter input.** → Add a clear/reset affordance and an invalid/error state hook.

## What it does well

- Exemplary sort semantics: correct `aria-sort` on the cell, real `<button>`, descriptive `aria-label` per column.
- Genuine craft: `initial={false}` (no first-render animation), `-ml-ds-01` optical flush, `select-none`, `tabular-nums`, documented sticky-surface reasoning.
- Responsive-by-default columns via `hideBelow` meta and pin-aware sticky positioning — features many table headers lack.
- Icon indicators fade+rotate (no slide-no-fade), driven by the shared `springs.snappy` — cohesive with DS motion.

## Cross-DS adoption ideas

- **MUI DataGrid — column header overflow menu**: consolidate sort / filter / hide / pin into one kebab per column instead of always-on inline rows; frees vertical space and scales to many columns.
- **MUI DataGrid / AG Grid — typed filter variants**: our filter is text-only. Offer per-column filter types (select, number-range, date) declared in `columnDef.meta`.
- **MUI DataGrid — column resize + drag-to-reorder handles** on the header cell.
- **Carbon DataTable — explicit sort-direction affordance + multi-sort priority badges** so users see sort order at a glance.
- **TanStack (our own engine) — surface `enableMultiSort`** with a numbered badge in the header indicator.

## Rebuild note

**Polish, not rebuild.** Structure and composition are sound; the deficits are localized correctness/finish bugs: (1) swap the dead `border-card-strong` for a real border token, (2) restore proper focus-visible rings on both the sort button and filter input, (3) gate the rotate motion behind reduced-motion, (4) logical margin for RTL + label truncation, (5) add the missing test file for the DataTable family. All in-place; no API or structural change required.
