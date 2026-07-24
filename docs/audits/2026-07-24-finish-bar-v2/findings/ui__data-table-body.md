# ui/data-table-body — finish-bar audit

Finish: 3/5   Market: LAGS(MUI DataGrid)   Rebuild: polish

Internal, non-exported sub-component of `DataTable`. Orchestrates tbody rendering:
data rows, inline cell-edit, expandable rows, skeleton loading, empty state, and
the virtual-row path. Composes `Table*` primitives + `Skeleton` + TanStack
Table/Virtual. Visual layer scored; base rendering is clean, but the opt-in
interactive features (row-click, cell-edit) fail the keyboard bar.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Role radius (`rounded-control`) only — no `rounded-ds-*`/`rounded-full`. DS surface tokens (`surface-base`, `surface-raised-hover`), DS spacing (`p-ds-05`, `px-ds-02`, `py-ds-07`, `h-ds-xs-plus`=28px). No edge-soup, no gradient/glow/accent-rail slop. `h-4 w-4`/`w-3/4` are stock utilities, not arbitrary bracket magic. Expanded row uses a `surface-base` recess (correctly reasoned for dark). |
| accessibility | ✗ | (1) Clickable rows (`onRowClick`) are a bare `<tr onClick>` — no `role`, `tabIndex`, or key handler → WCAG 2.1.1 keyboard failure. (2) Cell edit only enters via `onDoubleClick` — no keyboard path to edit mode. (3) `CellEditInput` uses `outline-hidden` and `focus:border-accent-7` on a `border-accent-7` base — focus produces zero visual change (no ring). All conditional on opt-in features; base table is accessible. |
| api-composability | ✓ | Generic `<TData>`, clean context consumption, composes `TableBody/Cell/Row` + `Skeleton` rather than re-rolling. Shared/virtual row path unified via `DataTableRow`. `INTERACTIVE_SELECTOR` guard prevents row-click firing on inner controls — good API instinct. |
| docs-dx | gap | Doc exists but is a 2-line internal stub (acceptable for a non-exported part). No stories for this sub-component (parent `data-table.stories.tsx` exercises it). |
| testing | ✗ | No `data-table*.test.tsx` exists anywhere — editing, expand, virtual, selection, empty, skeleton paths are entirely untested via RTL/axe. |
| motion-emil | gap | Expanded reveal animates `height:'auto'` (layout, not HW-accel transform/opacity) — mitigated by opacity co-animation + `springs.smooth` (bounce-free, damping≈critical) + `useReducedMotion` self-guard + instant swap on the virtual path. Height-spring is the only ding. No slide-no-fade (opacity:0 present). |
| state-coverage | ✓ | Loading (skeleton), empty/no-results, selected (`data-state`), editing, expanded, hover, and clickable all deliberately handled. Strong. |
| content-resilience | gap | Pinned cells use physical `left/right`; meta uses `text-right/center` — physical, not logical → RTL not mirrored. Cell overflow/truncation delegated to consumer cell renderer (no built-in strategy). Zero/one/many + virtual/non-virtual expand handled well. |
| theming-resilience | ✓ | All color via tokens; `forced-colors` mappings exist for `surface-base`/`surface-raised-hover` (→Canvas). Dark recess reasoning explicit in source. |
| system-cohesion | ✓ | Uses shared `springs.smooth`, DS `Skeleton`, DS `Table` primitives, role radius, `z-raised`. No bespoke drift. |
| craft | ✓ | Nice unseen details: `INTERACTIVE_SELECTOR` click-guard, auto-focus+select on edit, `cursor-pointer` only when clickable, virtual-vs-static reveal split. Undercut only by the missing keyboard affordances (scored in a11y). |
| perceived-performance | ✓ | Skeleton on load, TanStack virtualization, instant edit focus, transform-based virtual positioning (no CLS in the row layer). |
| market-benchmark | LAGS | vs MUI DataGrid / Carbon DataTable: PARITY on feature surface (virtual, pin, expand, inline edit, skeleton), but LAGS on the keyboard interaction model — DataGrid gives full cell keyboard nav, Enter-to-edit, and focus management out of the box. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] accessibility — clickable `<tr>` has no keyboard support → add `role="button"` + `tabIndex={0}` + Enter/Space handler (mirroring `handleRowClick`, same `INTERACTIVE_SELECTOR` guard) when `onRowClick` is set.
- [P1] accessibility — inline edit is double-click-only and the input shows no focus ring → add a keyboard trigger (Enter/F2 on a focused cell) and give `CellEditInput` a real `focus-visible` ring (drop `outline-hidden`, or use `focus:ring` + distinct border), since `border-accent-7`→`focus:border-accent-7` is a no-op.
- [P1] testing — zero RTL/axe coverage for the whole family → add `data-table.test.tsx` covering empty, loading-skeleton, selected, expand toggle, cell-edit save/cancel, and an axe pass on a clickable-row + editable table.
- [P2] content-resilience — physical `left/right`/`text-right` break RTL → move to logical properties (`inset-inline-start`, `text-end`) or `ltr:`/`rtl:` variants for pinned cells and alignment.
- [P2] motion-emil — height-spring reveal fights layout → acceptable, but consider `scaleY`/clip or measured max-height if jank appears on heavy expanded content.

## What it does well
- Genuinely clean visual layer: role radius, DS surface/spacing tokens, forced-colors coverage, no slop tells.
- Comprehensive state matrix (loading/empty/selected/editing/expanded) — most DS table bodies stop at default+empty.
- Thoughtful composition: single `DataTableRow` shared across virtual and static paths; `INTERACTIVE_SELECTOR` guard is the kind of detail that prevents "clicking the checkbox navigated the row" bugs.
- Reduced-motion + virtual-path instant-swap are self-guarded (no consumer MotionProvider dependency).

## Cross-DS adoption ideas
- MUI DataGrid: roving-tabindex cell navigation (arrow keys move focus cell-to-cell) + Enter/F2 to edit, Escape to cancel — adopt the keyboard model, we already have the edit machinery.
- Carbon DataTable: expandable rows expose `aria-expanded` + a dedicated expander button with an accessible name; our expand is render-prop only with no ARIA linkage between trigger and panel.
- TanStack Table examples: sticky/pinned columns typically pair a shadow on the pin edge to signal scroll-under; we mask with `surface-base` but give no depth cue.

## Rebuild note
Polish, not rebuild. The structure (context-driven, TanStack-composed, unified
row path) is sound and the visuals meet bar. Scope is bounded: (1) make
`onRowClick` rows keyboard-operable, (2) add a keyboard entry + real focus ring
to inline edit, (3) logical properties for RTL, (4) add the missing test file.
All in-place edits — no structural change to the render pipeline.
