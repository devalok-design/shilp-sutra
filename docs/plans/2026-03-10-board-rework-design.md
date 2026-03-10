# Board Section Rework — Design Document

**Date:** 2026-03-10
**Approach:** Full rearchitecture with BoardProvider context (Approach B)
**Aesthetic:** Linear-inspired minimalism + Notion typography + light glassmorphism
**Breaking:** Yes (0.x, acceptable)

---

## 1. Data Model

```typescript
interface BoardTask {
  id: string
  taskId: string              // Display ID e.g. "KRM-42"
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  labels: string[]
  dueDate: string | null
  isBlocked: boolean
  visibility: 'INTERNAL' | 'EVERYONE'
  owner: { id: string; name: string; image: string | null } | null
  assignees: { id: string; name: string; image: string | null }[]
  subtaskCount: number
  subtasksDone: number
}

interface BoardColumn {
  id: string
  name: string
  isClientVisible?: boolean
  wipLimit?: number           // null = unlimited
  tasks: BoardTask[]
}

interface BoardData {
  columns: BoardColumn[]
}

interface BoardFilters {
  search: string
  assignees: string[]
  priorities: string[]
  labels: string[]
  dueDateRange: 'overdue' | 'today' | 'this-week' | 'none' | null
}

type BoardViewMode = 'default' | 'compact'

interface BulkAction {
  type: 'move' | 'priority' | 'assign' | 'label' | 'dueDate' | 'delete' | 'visibility'
  taskIds: string[]
  value?: string | null
}
```

## 2. BoardProvider Context

Central context managing all board state:

- **Data:** columns (filtered view exposed to children)
- **View:** viewMode (default/compact), toggle
- **Filters:** search, priority, assignee, label, due date range; additive AND logic; instant filter with fade-out animation
- **Selection:** selectedTaskIds Set, toggle/range/selectAll/clear; shift+click range selection respects column order
- **Keyboard:** focusedTaskId, arrow key navigation (up/down in column, left/right across columns), Enter opens, Space toggles selection, Escape clears, `/` focuses search
- **My Tasks:** currentUserId (passed by consumer), highlightMyTasks toggle — dims non-owned cards to opacity-40
- **DnD:** activeTask state for drag overlay
- **Callbacks:** all optional at KanbanBoard props level, context provides no-op defaults
  - onTaskMove, onTaskAdd, onBulkAction, onColumnReorder, onColumnRename, onColumnDelete, onColumnToggleVisibility, onColumnWipLimitChange, onClickTask, onAddColumn
  - Quick actions: onQuickPriorityChange, onQuickAssign, onQuickDueDateChange, onQuickLabelAdd, onQuickVisibilityChange, onQuickDelete

## 3. Component Architecture

```
KanbanBoard (BoardProvider wrapper)
├── BoardToolbar
│   ├── SearchInput (cmd+K hint)
│   ├── FilterBar (priority, assignee, label, due date dropdowns)
│   ├── ActiveFilterChips (removable pills)
│   ├── ViewToggle (compact/default)
│   ├── MyTasksToggle
│   └── BulkActionBar (slides in when cards selected)
│       ├── SelectionCount
│       ├── Action buttons (move, priority, assign, label, date, visibility, delete)
│       └── ClearSelection
├── BoardCanvas
│   ├── BoardColumn (draggable + droppable, reorderable)
│   │   ├── ColumnHeader
│   │   │   ├── AccentDot (colored dot, Linear-style)
│   │   │   ├── ColumnName (editable on double-click)
│   │   │   ├── TaskCount / WipIndicator
│   │   │   ├── AvatarStack (who's working here)
│   │   │   └── ColumnMenu (rename, WIP limit, visibility, delete)
│   │   ├── TaskCard (default mode)
│   │   ├── TaskCardCompact (compact mode)
│   │   └── ColumnEmpty (line-art illustration + CTA)
│   └── AddColumnButton
└── DragOverlay (portal)
```

### TaskCard (default mode)
- SelectionCheckbox (hover or when any card selected)
- TaskIdBadge (top-left, muted mono)
- Title (2-line clamp)
- PriorityIcon (flag/arrow icon, not a dot)
- LabelChips (up to 3, +N overflow)
- SubtaskProgress (mini bar + "3/5")
- BottomRow: DueDateBadge, VisibilityBadge (if EVERYONE), BlockedBadge (if blocked), Spacer, OwnerAvatar (ring-accented, larger), AssigneeAvatars (stacked, smaller)
- ContextMenu (right-click: priority, assign, label, date, visibility, delete)

### TaskCardCompact
- Single row: SelectionCheckbox, PriorityIcon, TaskIdBadge, Title (1-line), Spacer, SubtaskCount ("3/5" text), OwnerAvatar

## 4. Visual Design

Uses existing shilp-sutra token system throughout. No custom colors or ad-hoc values.

### Cards (default)
- `bg-surface`, `border border-border-subtle`, `rounded-lg`
- `shadow-01` rest → `shadow-02` hover
- `backdrop-blur-sm` on drag overlay (glassmorphism touch)
- `transition-all duration-150`
- Selected: `ring-2 ring-accent bg-interactive-subtle/30`
- Dimmed (my-tasks, not mine): `opacity-40`
- Focused (keyboard): `ring-2 ring-accent-subtle` dashed

### Cards (compact)
- Single row, `py-1.5 px-3`, no shadow, `border-b border-border-subtle`

### Columns
- Small colored dot next to name (not full left border)
- `bg-surface-secondary/50 backdrop-blur-[2px]`
- `rounded-xl`, width `320px`
- WIP exceeded: dot turns red, `bg-error/5` tint

### Toolbar
- Sticky top, `bg-surface/80 backdrop-blur-md`
- Bulk action bar slides down with same glass bg

### Typography (all from token system)
- Title: `text-sm font-medium text-text-primary`
- Task ID: `text-xs font-mono text-text-tertiary`
- Labels: `text-xs` pills, `bg-surface-tertiary rounded-full`
- Column name: `text-sm font-semibold text-text-primary`

## 5. Interactions

### Drag & Drop
- @dnd-kit retained — pointer 5px, touch 200ms, keyboard sensors
- Columns reorderable (horizontal SortableContext)
- Drag overlay: `rotate-[2deg] shadow-03 backdrop-blur-sm scale-[1.02]`
- Drop target: `bg-interactive-subtle/30` pulse
- Spring ease-out, 200ms

### Right-click Context Menu
- Uses core DropdownMenu (or ContextMenu if available)
- Items: Set Priority ▸, Assign ▸, Add Label ▸, Set Due Date, Set Visibility ▸, Delete
- Also accessible via `...` hover button (touch/a11y)

### Bulk Selection
- Checkbox toggle single, shift+click range
- Toolbar shows count + action buttons
- Bulk action → popover for value selection → clears selection on complete

### Filters
- Instant — non-matching cards fade `opacity-30 scale-[0.97]` then remove from flow (150ms)
- Active filter chips below toolbar, removable
- "Clear all" button
- Search debounced 200ms, matches title + taskId

### My Tasks Mode
- Dims non-owned cards to `opacity-40`
- Stacks with filters (filters hide, my-tasks dims)

### WIP Limits
- Header shows `3/5` count
- `text-error` + red dot when exceeded
- Soft limit (still allows adding, shows warning shake)

### Keyboard
- Arrow keys: up/down in column, left/right across columns
- Enter: open task
- Space: toggle selection
- Shift+Arrow: extend selection
- Escape: clear selection/filters
- `/`: focus search

### Empty States
- Minimal line-art illustrations per column (cycling set)
- `text-text-quaternary` color
- "Drop tasks here" + "Add task" button
