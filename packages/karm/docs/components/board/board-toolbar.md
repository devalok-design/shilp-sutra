# BoardToolbar

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    ...HTMLAttributes<HTMLDivElement>

## Features
- Debounced search input (200ms)
- Priority filter (multi-select checkbox dropdown: LOW, MEDIUM, HIGH, URGENT)
- Assignee filter (multi-select checkbox dropdown, derived from board members)
- Label filter (multi-select checkbox dropdown, derived from task labels)
- Due date filter (radio: overdue, today, this-week)
- "Highlight my tasks" toggle button
- View mode toggle (SegmentedControl: Board / Compact)
- Active filter chips with individual dismiss and "Clear all" button

## Example
```jsx
{/* Rendered automatically by KanbanBoard, or manually inside BoardProvider */}
<BoardProvider initialData={data}>
  <BoardToolbar />
</BoardProvider>
```

## Gotchas
- Must be rendered inside a BoardProvider context.
- No props needed — all state comes from context.
- Assignee and Label filter dropdowns only render when members/labels exist.
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
