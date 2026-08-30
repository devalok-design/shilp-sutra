---
"@devalok/shilp-sutra": minor
---

DataTable's bulk-action bar is now the shared `BulkActionBar`, not a thinner copy

DataTable shipped its own bulk bar, parallel to `BulkActionBar` and worse. It
declared `role="toolbar"` while implementing plain tab stops — telling
screen-reader users to expect one tab stop and arrow-key navigation, and
delivering neither. That is the defect that motivated this, and it was sitting
on the higher-traffic path.

The copy had also drifted four ways inside one release cycle: raw `bottom-6`
instead of the spacing token, a non-RTL `left-1/2`, `outline` against this
repo's own documented soft-over-outline preference, and a bare `<button>` where
`Button` belonged.

**DataTable's public API is unchanged.** `bulkActions`, `bulkActionsPosition`,
and `onClick(selectedRows)` all behave exactly as before —
`DataTableBulkActions` is now a thin adapter that closes over the selected rows
and keeps wiring `table.resetRowSelection()` itself. Nothing to migrate.

What DataTable gains, all of it previously ignored even though `BulkAction`
already declared the props:

- roving focus with Arrow keys, Home and End, RTL-mirrored, and a real single
  tab stop
- `requiresConfirmation` / `confirmMessage` — an inline confirm step for
  destructive actions
- per-action `loading`
- Escape to clear, and reduced-motion support

**`BulkActionBar` gains `placement`** (`'bottom' | 'top' | 'inline'`, default
`'bottom'` — unchanged behaviour). Position and portalling are one prop
deliberately: a portal escapes its ancestors' stacking context, so a portalled
bar inside a Dialog or Sheet floats over the page instead of belonging to the
overlay. `inline` renders in flow and is the answer there. Every system surveyed
before building this — Carbon, Polaris, Material — renders its bulk bar in flow.

**The implementation moved** from `composed/bulk-action-bar` to
`ui/bulk-action-bar`, because `ui/` may not import `composed/` and DataTable
lives in `ui/`. The old subpath still resolves via a re-export, and a new
`@devalok/shilp-sutra/ui/bulk-action-bar` subpath is available.

Two small behaviour changes fall out of the convergence, both improvements:

- The toolbar's accessible name is now the stable `"Bulk actions"` rather than
  `"N items selected"`. A name that changes on every selection change gets
  re-announced; the count is already carried by the Badge inside.
- Non-destructive actions render `ghost` rather than `outline`. Destructive
  (`color: 'error'`) actions stay `solid` — quietness is right for the bar, but
  not for a Delete.
