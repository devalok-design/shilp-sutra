# ColumnHeader

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    column: BoardColumn (REQUIRED)
    index: number (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## Features
- Color-coded accent dot (cycles through COLUMN_ACCENT_COLORS by index)
- Column name with task count badge
- Double-click to rename (inline Input)
- WIP limit display with exceeded state (error color)
- Inline WIP limit editor
- Quick-add task form (title, owner picker, due date picker)
- Column options dropdown: Rename, Set WIP Limit, Show/Hide from client, Delete column
- Avatar stack of unique members in the column (AvatarGroup, max 3)

## Example
```jsx
{/* Rendered automatically by BoardColumn */}
<ColumnHeader column={column} index={0} />
```

## Gotchas
- Must be rendered inside a BoardProvider context.
- Reads members, onColumnRename, onColumnDelete, onColumnToggleVisibility, onTaskAdd from context.
- Quick-add form expands with animation (AnimatePresence + framer-motion).
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
