# ui/data-table-context — finish-bar audit

Finish: 3/5   Market: LAGS(TanStack Table)   Rebuild: polish

Non-visual utility: React context provider + pure helper functions (`getColumnMetaClasses`, `getPinnedCellStyle`, `isColumnEditable`, `INTERACTIVE_SELECTOR`, `EditingCell`) that binds DataTable's sub-components (header/body/pagination/card) to a shared TanStack `Table` instance. Motion, most a11y, state, and perceived-performance axes are N/A — it renders no UI of its own. Scored only the applicable axes.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Only emits classNames. No radius-ds / rounded-full / arbitrary magic numbers / edge-soup — clean. But `getPinnedCellStyle` hardcodes `bg-surface-base` for pinned cells, which won't match a striped or hovered row's own background — pinned column visually punches a different color through the row. |
| accessibility | N/A | No ARIA/keyboard here (owned by header/body). `INTERACTIVE_SELECTOR` correctly excludes buttons/links/inputs/`[role=checkbox]` from row-click — a real UX/a11y craft detail, not a defect. |
| api-composability | ✓ | Generic `<TData>`, typed context, explicit throw when used outside provider. Minor: `DataTableProvider` casts `value as DataTableContextValue` (erases the generic), `allColumns: {id?; header?: unknown}[]` and `meta?: Record<string, unknown>` are loosely typed. Acceptable for an internal, non-exported-to-consumers context. |
| docs-dx | gap | Doc EXISTS but is STALE/INACCURATE: claims the context carries "density, selection, loading" — source has no `density` or `loading` field. Says "Not exported to consumers" yet 5 symbols are exported and none are documented. Doc-rot tell; source is truth. |
| testing | ✗ | No `.test.tsx`, no stories. `getPinnedCellStyle`, `isColumnEditable`, `getColumnMetaClasses` are pure, branch-heavy functions — trivially unit-testable and currently 0% covered. A test would have caught the multi-pin bug below. |
| motion | N/A | No animation in a context provider. |
| state-coverage | N/A | Manages `editingCell` state pass-through only; visual states owned by consumers. |
| content-resilience | gap | `getColumnMetaClasses` handles align + `hideBelow` sm/md/lg well. But `getPinnedCellStyle` sets `left: 0` / `right: 0` for ANY pinned column regardless of `leftIndex`/`rightIndex` — two+ pinned columns on the same side all stack at offset 0 and overlap. Only single-column-per-side pinning works. |
| theming-resilience | ✓ | Uses semantic `bg-surface-base` (adapts light/dark, has forced-colors `Canvas` mapping) and the `z-raised` utility. No hardcoded colors. |
| system-cohesion | ✓ | Consumes shared semantic tokens + `z-raised` util consistent with siblings; no bespoke drift. (Slight coupling smell: pinned bg vs row bg — see visual-integrity.) |
| craft | gap | Nice: `tabular-nums` on right-aligned cells, `INTERACTIVE_SELECTOR`, explicit provider error. Undercut by the pinned-bg mismatch and the multi-pin offset-0 overlap. |
| perceived-perf | N/A | Pure synchronous helpers; no render/perf surface of its own. |
| market-benchmark | ✗ | Peer: TanStack Table. `getPinnedCellStyle` reinvents (worse) what TanStack already provides — `column.getStart('left')` / `column.getAfter('right')` return cumulative pixel offsets for correct multi-column sticky positioning, and `column.getIsPinned()` gives pin state. We wrap a TanStack `Table` but ignore its pinning helpers and hand-roll a broken 0-offset. Strictly behind the peer we're built on. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] content-resilience / market — `getPinnedCellStyle` ignores `leftIndex`/`rightIndex` and returns `left:0`/`right:0` for every pinned column → multi-column pinning overlaps. Fix: compute cumulative offset from TanStack (`column.getStart('left')` / `getAfter('right')`) or sum measured widths.
- [P1] testing — Zero tests on pure branch-heavy helpers. Add unit tests for `getPinnedCellStyle` (0/1/many pinned per side), `isColumnEditable` (internal cols, `enableEditing:false`, missing col), `getColumnMetaClasses` (align + each `hideBelow`).
- [P2] docs-dx — Doc lists `density`/`loading`/`selection` fields the context does not have, and documents none of the exported helpers. Rewrite to match source (or note it's intentionally internal and drop the false field list).
- [P2] visual-integrity / craft — Pinned cell hardcodes `bg-surface-base`; make it inherit the row's resolved background (or a dedicated pinned-surface token) so striped/hover rows don't show a mismatched pinned column.

## What it does well
- `INTERACTIVE_SELECTOR` guards row-click against interactive children (button/a/input/select/textarea/`[role=checkbox]`) — the exact craft detail teams forget, causing accidental navigation on checkbox clicks.
- `tabular-nums` auto-applied to right-aligned columns — numeric alignment without consumer effort.
- Explicit `useDataTableContext` throw with a clear message; generic `<TData>` threading; clean token usage (`bg-surface-base`, `z-raised`, no arbitrary values).
- Responsive column hiding baked into meta (`hideBelow` sm/md/lg) is a tidy, declarative content-resilience win.

## Cross-DS adoption ideas
- TanStack Table: adopt `column.getStart('left')` / `column.getAfter('right')` for correct cumulative sticky offsets (fixes the multi-pin bug for free) and `column.getIsPinned()` instead of hand-scanning `columnPinningState`.
- TanStack pinning demos add a box-shadow on the last-pinned column of each side to signal the pin boundary during horizontal scroll — we render no pin-edge affordance. Consider a `shadow-*` on the boundary cell.
- Carbon / MUI DataGrid resolve the pinned-cell background from the row's own state (default/striped/hover/selected) so pinned columns stay visually continuous with their row — worth mirroring instead of a fixed `bg-surface-base`.

## Rebuild note
Polish, not rebuild. The context architecture and helper decomposition are sound and cohesive with the DS. Scope: (1) rewrite `getPinnedCellStyle` to use TanStack's cumulative offset helpers (fixes multi-column pinning); (2) resolve pinned-cell background from row state rather than hardcoding `bg-surface-base`; (3) add unit tests for the three pure helpers; (4) correct the stale doc. No structural change to the provider or its API.
