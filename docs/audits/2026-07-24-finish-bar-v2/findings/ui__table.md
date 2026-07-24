# ui/table — finish-bar audit
Finish: 4/5   Market: LEADS (shadcn table, presentational tier)   Rebuild: polish

Thin, server-safe (`// @server-safe`) set of semantic `<table>` wrappers — the presentational tier; the sorting/selection/pagination machinery lives in `ui/data-table`. Every P1 from the 2026-07-01 baseline (3/5) is now fixed: row separator restored, hover token corrected to `surface-raised-hover`, `density`/`striped`/`numeric` props added, footer `color-mix` replaced with a `surface-base` band, and an explicit selected+hover (`accent-4`) step. Plus two genuinely well-built additions — `TableRowActions` (opacity/focus-within reveal, permanently tabbable, `pointer-coarse` fallback) and `TableRowLink` (real anchor, cell-anchored `100vw` stretch, row-level focus ring). The remaining gaps are minor and specific: forced-colors selection cue, RTL physical properties, one magic pixel.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail/gradient/edge-soup/emoji. Semantic tokens throughout (`border-surface-border-subtle`, `surface-base`, `accent-3/4/9`). No radius violation — `table-row-link` uses `rounded-control-inner` (role token). One magic pixel: `[&>[role=checkbox]]:translate-y-[2px]` (TableHead+TableCell). |
| accessibility | gap | `scope="col"`, semantic HTML, axe-clean; RowActions honors WCAG 1.4.13 (reveal on focus, always-tabbable); RowLink real anchor + row-level ring. **Gap:** `data-[state=selected]:bg-accent-3` has no `forced-colors:` fallback — tint collapses in high-contrast with no border/outline cue (carried from baseline, still open). |
| api-composability | ✓ | 9 compound parts, `forwardRef`+`displayName` on all, specific element types, exported prop types. `numeric`, `density`, `striped`, `persist`, `stretch` — all opt-in, non-breaking. `--table-edge` inherits `--card-spacing` inside Card. `useLink()` context makes RowLink framework-agnostic. No CVA, but density-map is fine for a presentational primitive. |
| docs-dx | ✓ | Props/Compound/Example/Composability/Cell recipes/density→avatar table/Gotchas/Changes — all present and match source. Table-vs-DataTable guidance is explicit. |
| testing | ✓ | RTL + vitest-axe; covers density, striped, numeric, selected+hover, footer band, hover wash, RowActions reveal/persist, RowLink stretch/title modes. No `describeConformance` (N/A — no CVA). |
| motion | ✓ | Server-safe, no framer. Only `transition-opacity duration-fast-01 ease-productive-standard` (RowActions) + `transition-colors` (row hover) — correct curve, fast, HW-accel. Minor: opacity reveal has no `motion-safe` guard (negligible for a <150ms opacity fade). |
| state-coverage | ✓ | hover, selected, selected+hover (explicit accent-4), focus-visible (row-level via `has-[]`), empty (story + em-dash recipe w/ aria-label), striped — all deliberately designed. disabled/loading/error are N/A (DataTable's job). forced-colors gap tracked under a11y. |
| content-resilience | gap | Excellent overflow story: wrapper `overflow-auto`, `overflow-x-clip` containment, TruncatedText, tag `+N` overflow, `tabular-nums`, empty em-dash. **Gap:** physical properties for RTL — `first:pl-/last:pr-`, `text-left`, `after:left-0` (row-link) don't mirror; should be logical (`ps-/pe-`, `text-start`, `inset-inline-start`). |
| theming-resilience | ✓ | Survives accent swap (accent-token driven); `density` presets built in; light↔dark handled deliberately — comments call out the 0.44 invisible-hover bug and the footer band explicitly reads against the card surface, not a translucent raised wash. |
| system-cohesion | ✓ | Shares surface/border tokens, focus-ring language, ds-spacing, `productive-standard` easing with siblings. `--table-edge`←`--card-spacing` inheritance is exemplary cohesion — edge columns align with the enclosing Card's slots. |
| craft | ✓ | Leads here: cell-anchored stretch (Safari `<tr>` position:relative fix), `overflow-x-clip` to swallow the `100vw` pseudo without a scrollbar, row-level ring while the anchor suppresses its own, `pointer-coarse` always-visible actions, tabular figures on numerics. Real unseen-detail work. |
| perceived-perf | ✓ | No CLS — opacity reveal (not display:none), no hydration cost (server-safe), wrapper owns scroll. |
| market-benchmark | LEADS | vs shadcn table (its lineage, the fair presentational peer): superset — shadcn has no density, striped, numeric, row-action reveal, row-link stretch, or card-spacing inheritance. Carbon/MUI/TanStack are full data-grids → that tier is our DataTable, not this. On the presentational tier this leads. |
| cross-ds-adoption | gap | Missing patterns worth importing (below). |

## Top gaps (prioritized)
- [P1] accessibility — selected-row tint (`accent-3`) vanishes in `forced-colors`/high-contrast with no fallback → add `forced-colors:outline forced-colors:outline-1` (or a system-color cue) to the `data-[state=selected]` rule so selection survives.
- [P2] content-resilience — physical properties won't mirror in RTL (`first:pl-`, `last:pr-`, `text-left`, `after:left-0`) → migrate to logical (`ps-`/`pe-`, `text-start`, `inset-inline-start`) for a clean RTL pass.
- [P2] visual-integrity/craft — `translate-y-[2px]` checkbox nudge is an untokenized magic pixel (2 call sites) → tokenize or replace with `items-center` on the cell flex.
- [P3] motion — opacity reveal lacks a `motion-safe` guard; add for completeness (very low impact at this duration).

## What it does well
- Every 0.45.0 fix landed correctly and is now test-locked (separator, hover token, footer band, selected+hover step) — the exact bugs that hid last time now have assertions.
- `--table-edge`←`--card-spacing` inheritance: tables inside Cards align their edge columns to the card's slots automatically, standalone falls back to ds-04. Quietly excellent system thinking.
- `TableRowLink` is best-in-class row navigation: a real anchor (cmd/middle-click, context menu, SR "link" all work), cell-anchored `100vw` stretch clipped by `overflow-x-clip`, row-level focus ring — solves the "onClick-on-`<tr>`" anti-pattern properly.
- `TableRowActions` reveal respects keyboard (focus-within) and touch (pointer-coarse), stays permanently in tab order — WCAG 1.4.13 done right, not display:none.

## Cross-DS adoption ideas
- **Carbon `stickyHeader`** — a `stickyHeader` prop on Table (sticky `<thead>` inside the scroll wrapper) is the single most-requested affordance a bare table still lacks; cheap given the wrapper already owns scroll.
- **Carbon / MUI overflow-menu column** — a first-class "actions" column recipe pairing `TableRowActions` with an `IconButton` + Menu (the docs recipe exists; a slot would remove the boilerplate).
- **MUI density↔content coupling** — the density→avatar mapping is documented but purely advisory; consider exposing row-height as a data attribute so cell recipes could read it, rather than the consumer hand-matching avatar size to density.

## Rebuild note
`polish`, not rebuild — the structure is right and market-leading for a presentational table. Three in-place fixes close it out: (1) forced-colors cue on the selected-row rule, (2) physical→logical properties for RTL across cells and the row-link stretch, (3) tokenize the `translate-y-[2px]` checkbox nudge. A `stickyHeader` prop is the one worthwhile additive follow-up. None are structural; all are safe, non-breaking additions.
