# BulkActionBar

- Import: @devalok/shilp-sutra/ui/bulk-action-bar
- Server-safe: No
- Category: ui

Also re-exported from `@devalok/shilp-sutra/composed/bulk-action-bar`, which is
where it used to live. Both paths work. The implementation sits in `ui/` because
`DataTable` uses it and `ui/` may not import `composed/`.

## Props
    show: boolean (controls visibility)
    count: number (number of selected items — displayed in badge)
    onClearSelection: () => void
    actions: BulkActionBarAction[]
    totalCount: number (optional — total selectable items; enables "Select all")
    onSelectAll: () => void (optional — called by the "Select all" control)
    placement: "bottom" | "top" | "inline" (default: "bottom")
    className: string
    ...div attributes (forwardRef to the toolbar div; HTMLAttributes spread)

### BulkActionBarAction
    label: string
    icon: IconInput (optional — any icon component or element)
    onClick: () => void
    color: "accent" | "error" | "success" | "warning" | "info" | "neutral" (default: "accent")
    disabled: boolean (optional)
    loading: boolean (optional — pending spinner on the action)
    requiresConfirmation: boolean (optional — inline confirm before executing)
    confirmMessage: string (optional — default "Are you sure?")

## Defaults
    placement: "bottom"

## Example
```jsx
<BulkActionBar
  show={selected.length > 0}
  count={selected.length}
  onClearSelection={() => setSelected([])}
  actions={[
    { label: 'Archive', icon: IconArchive, onClick: archiveSelected },
    {
      label: 'Delete',
      icon: IconTrash,
      onClick: deleteSelected,
      color: 'error',
      requiresConfirmation: true,
    },
  ]}
/>
```

Inside a Dialog or Sheet, use `placement="inline"` so the bar stays within the
overlay:

```jsx
<BulkActionBar placement="inline" show={n > 0} count={n} … />
```

## Composability
- **Standalone floating toolbar** — use with DataTable, TreeView, or any selection-capable UI.
- **DataTable auto-integration:** DataTable's `bulkActions` prop renders this internally, so you rarely render it directly alongside a DataTable. `bulkActionsPosition` maps to `placement`.
- **Data-driven actions:** `{ label, icon, onClick, color, disabled, loading, requiresConfirmation }[]`. Destructive confirmation is built in — set `requiresConfirmation` rather than reaching for ConfirmDialog.
- **Placement decides portalling.** `bottom` / `top` portal to `document.body` and pin to the viewport. `inline` renders in flow, in place.

## Gotchas
- `placement="bottom"` / `"top"` render via `createPortal` into `document.body`, so they do not appear during SSR — they mount client-side only. `placement="inline"` has no portal and renders server-side normally.
- **A portal escapes its ancestors' stacking context.** Inside a Dialog or Sheet, a portalled bar floats over the page instead of belonging to the overlay — use `placement="inline"` there. This is why placement and portalling are one prop rather than two.
- Pinned placements use `z-sticky`; ensure no other fixed element conflicts.
- Follows the ARIA toolbar model: one tab stop, roving focus on Arrow / Home / End (mirrored under `dir="rtl"`), Escape to clear or to cancel a pending confirmation. If you wrap the actions in anything that also handles arrow keys, the two will fight.
- Uses Framer Motion AnimatePresence; respects `prefers-reduced-motion`.
