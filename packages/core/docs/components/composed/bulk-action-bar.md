# BulkActionBar

- Import: @devalok/shilp-sutra/composed/bulk-action-bar
- Server-safe: No
- Category: composed

This path is a re-export and keeps working. The implementation moved to
`ui/bulk-action-bar` so `DataTable` could use it — `ui/` may not import
`composed/`. **See [ui/bulk-action-bar](../ui/bulk-action-bar.md) for the full
reference**; it is the canonical doc and this one only mirrors the surface.

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
    { label: 'Delete', icon: IconTrash, onClick: deleteSelected, color: 'error' },
  ]}
/>
```

## Composability
- **Standalone floating toolbar** — use with DataTable, TreeView, or any selection-capable UI.
- **DataTable auto-integration:** DataTable's `bulkActions` prop renders this internally; `bulkActionsPosition` maps to `placement`.
- **Placement decides portalling** — `bottom` / `top` portal to the body, `inline` renders in flow.

## Gotchas
- Prefer importing from `@devalok/shilp-sutra/ui/bulk-action-bar`. This path is kept so existing imports do not break.
- Portalled placements do not render during SSR; `inline` does.
- Inside a Dialog or Sheet use `placement="inline"`, or the portal escapes the overlay's stacking context.
