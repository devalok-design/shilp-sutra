# BulkActionBar

- Import: @devalok/shilp-sutra/composed/bulk-action-bar
- Server-safe: No
- Category: composed

## Props
    show: boolean (controls visibility)
    count: number (number of selected items — displayed in badge)
    onClearSelection: () => void
    actions: BulkActionBarAction[]
    className: string

### BulkActionBarAction
    label: string
    icon: ComponentType<{ className?: string }> (optional icon component)
    onClick: () => void
    color: "default" | "error"
    disabled: boolean

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
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- Renders via `createPortal` into `document.body` — will not appear during SSR (mounts only client-side)
- Positioned fixed at bottom-center with `z-50`; ensure no other fixed elements conflict
- Uses Framer Motion AnimatePresence for slide-in/out animation
