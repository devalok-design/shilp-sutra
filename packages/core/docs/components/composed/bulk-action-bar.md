# BulkActionBar

- Import: @devalok/shilp-sutra/composed/bulk-action-bar
- Server-safe: No
- Category: composed

## Props
    show: boolean (controls visibility)
    count: number (number of selected items — displayed in badge)
    onClearSelection: () => void
    actions: BulkActionBarAction[]
    totalCount: number (optional — total selectable items; enables "Select all")
    onSelectAll: () => void (optional — called by the "Select all" control)
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
    (no optional props with defaults)

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
- **DataTable auto-integration:** DataTable's `bulkActions` prop renders this internally — typically you don't render BulkActionBar directly when using DataTable.
- **Data-driven actions:** `{ label, icon, onClick, color, disabled }[]`. For destructive confirmation, call ConfirmDialog from the onClick handler.
- **Portal to body + fixed bottom-center z-50** — independent of parent layout. Check for other fixed elements that might overlap.

## Gotchas
- Renders via `createPortal` into `document.body` — will not appear during SSR (mounts only client-side)
- Positioned fixed at bottom-center with `z-50`; ensure no other fixed elements conflict
- Uses Framer Motion AnimatePresence for slide-in/out animation
