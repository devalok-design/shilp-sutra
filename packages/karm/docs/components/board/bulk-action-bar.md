# BulkActionBar

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    ...HTMLAttributes<HTMLDivElement>

## Features
- Animates in/out when tasks are selected (AnimatePresence)
- Shows selection count with clear button
- Dropdown actions: Move to column, Set priority, Assign, Set visibility
- Delete button (right-aligned, error-colored)
- All actions trigger onBulkAction from context then clear selection

## Bulk Action Shape
    { type: 'move' | 'priority' | 'assign' | 'label' | 'dueDate' | 'delete' | 'visibility', taskIds: string[], value?: string | null }

## Example
```jsx
{/* Rendered automatically by KanbanBoard, or manually inside BoardProvider */}
<BoardProvider initialData={data} onBulkAction={handleBulk}>
  <BulkActionBar />
</BoardProvider>
```

## Gotchas
- Must be rendered inside a BoardProvider context.
- No props needed — all state comes from context.
- Only visible when selectedTaskIds.size > 0.
- Assign dropdown only renders when members exist.
- Forwards ref to outer div.
- Uses aria-live="polite" for screen reader announcements.

## Changes
### v0.18.0
- **Added** Initial release
