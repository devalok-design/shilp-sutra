# BoardColumn

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    column: BoardColumn (REQUIRED)
    index: number (REQUIRED)
    isOverlay: boolean
    dragPreview: { taskId: string; columnId: string; index: number }
    draggedTask: BoardTask | null
    ...HTMLAttributes<HTMLDivElement>

## Defaults
    isOverlay=undefined, dragPreview=undefined, draggedTask=undefined

## Example
```jsx
<BoardColumn column={column} index={0} />
```

## Gotchas
- Must be rendered inside a BoardProvider context.
- Reads viewMode from context to switch between TaskCard and TaskCardCompact.
- Renders ColumnHeader, TaskContextMenu wrappers, and ColumnEmpty automatically.
- When column.wipLimit is set and exceeded, the column background turns error-colored.
- Fixed width defined by COLUMN_WIDTH constant.
- Forwards ref to outer div.
- Uses @dnd-kit useDroppable for drop target and SortableContext for task reordering.
- Ghost silhouette (TaskGhost) is rendered at the dragPreview position during cross-column drags.

## Changes
### v0.18.0
- **Added** Initial release
