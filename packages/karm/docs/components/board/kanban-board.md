# KanbanBoard

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    initialData: BoardData (REQUIRED)
    currentUserId: string | null (default: null)
    members: BoardMember[] (explicit member list; falls back to deriving from task assignees)
    onTaskMove: (taskId: string, toColumnId: string, newOrder: number) => void
    onTaskAdd: (columnId: string, options: NewTaskOptions) => void
    onBulkAction: (action: BulkAction) => void
    onColumnReorder: (columnId: string, newIndex: number) => void
    onColumnRename: (columnId: string, name: string) => void
    onColumnDelete: (columnId: string) => void
    onColumnToggleVisibility: (columnId: string, visible: boolean) => void
    onColumnWipLimitChange: (columnId: string, limit: number | null) => void
    onClickTask: (taskId: string) => void
    onAddColumn: () => void
    onQuickPriorityChange: (taskId: string, priority: string) => void
    onQuickAssign: (taskId: string, userId: string) => void
    onQuickDueDateChange: (taskId: string, date: string | null) => void
    onQuickLabelAdd: (taskId: string, label: string) => void
    onQuickVisibilityChange: (taskId: string, visibility: string) => void
    onQuickDelete: (taskId: string) => void
    className: string

## Defaults
    currentUserId=null

## Example
```jsx
<KanbanBoard
  initialData={{ columns: [...] }}
  currentUserId="user-1"
  members={teamMembers}
  onTaskMove={(taskId, toCol, order) => moveTask(taskId, toCol, order)}
  onClickTask={(taskId) => openDetail(taskId)}
  onAddColumn={() => createColumn()}
/>
```

## Gotchas
- This is the top-level orchestrator. It composes BoardProvider, BoardToolbar, BulkActionBar, and BoardColumn internally.
- All callback props are optional and default to no-op. Wire them up to persist changes.
- Extends Omit<BoardProviderProps, 'children'> plus className. Forwards ref to outer div.
- Drag-and-drop uses @dnd-kit (PointerSensor, TouchSensor, KeyboardSensor).
- The "Add column" button is always rendered at the end of the horizontal scroll area.

## Changes
### v0.18.0
- **Added** Initial release
