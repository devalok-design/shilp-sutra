# BoardProvider

- Import: @devalok/shilp-sutra-karm/board
- Server-safe: No
- Category: board

## Props
    initialData: BoardData (REQUIRED)
    currentUserId: string | null (default: null)
    members: BoardMember[] (explicit member list for assignment dropdowns; falls back to deriving from task assignees)
    children: ReactNode (REQUIRED)
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

## Defaults
    currentUserId=null

## Context Value (useBoardContext)
    columns: BoardColumn[] (filtered)
    rawColumns: BoardColumn[] (unfiltered)
    members: BoardMember[]
    viewMode: BoardViewMode
    setViewMode: (mode: BoardViewMode) => void
    filters: BoardFilters
    setFilters: (updates: Partial<BoardFilters>) => void
    clearFilters: () => void
    hasActiveFilters: boolean
    selectedTaskIds: Set<string>
    toggleTaskSelection: (taskId: string) => void
    selectRange: (fromId: string, toId: string) => void
    selectAll: () => void
    clearSelection: () => void
    focusedTaskId: string | null
    setFocusedTaskId: (id: string | null) => void
    currentUserId: string | null
    highlightMyTasks: boolean
    setHighlightMyTasks: (on: boolean) => void
    activeTask: BoardTask | null
    setActiveTask: (task: BoardTask | null) => void
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

## Example
```jsx
<BoardProvider initialData={data} currentUserId="user-1" onTaskMove={handleMove}>
  <BoardToolbar />
  <BulkActionBar />
  {/* custom layout */}
</BoardProvider>
```

## Gotchas
- Must wrap all board sub-components (BoardColumn, BoardToolbar, BulkActionBar, etc.).
- useBoardContext() throws if used outside BoardProvider.
- All callback props default to no-op internally.
- columns in context are filtered; use rawColumns for unfiltered data.
- Syncs with initialData changes via useEffect.

## Changes
### v0.18.0
- **Added** Initial release
