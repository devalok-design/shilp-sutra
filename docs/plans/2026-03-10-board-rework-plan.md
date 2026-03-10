# Board Section Rework — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rearchitect the Karm board section with BoardProvider context, richer cards, filtering, bulk actions, keyboard navigation, and a Linear + Notion + light-glass aesthetic — all built on the shilp-sutra token system.

**Architecture:** Central `BoardProvider` context owns all state (filters, selection, keyboard focus, view mode, DnD). Components subscribe to context slices. Existing `@dnd-kit` retained for drag-and-drop. Core UI components (ContextMenu, DropdownMenu, Badge, Button, Input, AvatarGroup, Checkbox, Progress) reused — no reinventing.

**Tech Stack:** React 18, TypeScript, @dnd-kit, CVA, Tailwind (shilp-sutra tokens), Tabler Icons, Vitest + RTL + vitest-axe

**Design Doc:** `docs/plans/2026-03-10-board-rework-design.md`

**Review Protocol:** User reviews at checkpoints marked with 🔍. Do NOT proceed past a checkpoint until user approves.

---

## Token Reference (use these, don't invent values)

| Purpose | Token class |
|---------|-------------|
| Card bg | `bg-layer-01` |
| Column bg | `bg-layer-02` (or `bg-field/50` for glass) |
| Toolbar bg | `bg-background/80` with `backdrop-blur-md` |
| Card border | `border-border-subtle` |
| Card shadow rest | `shadow-01` |
| Card shadow hover | `shadow-02` |
| Card shadow drag | `shadow-03` |
| Text primary | `text-text-primary` |
| Text secondary | `text-text-secondary` |
| Text muted | `text-text-tertiary` |
| Accent ring | `ring-accent` |
| Error | `text-error`, `bg-error-surface`, `border-error` |
| Warning | `text-warning`, `bg-warning-surface` |
| Success | `text-success`, `bg-success-surface` |
| Spacing unit | `gap-ds-{01-13}`, `p-ds-{01-13}` |
| Radius card | `rounded-lg` (--radius-lg) |
| Radius column | `rounded-xl` (--radius-xl) |
| Transition | `duration-150` with `ease-productive-standard` |
| Focus ring | `ring-2 ring-focus ring-offset-2` |
| Category dots | `bg-category-{cyan,amber,teal,indigo,orange,emerald,slate}` |
| Overlay z | `z-[1200]` (--z-overlay) |

---

## Task 1: Types & Shared Constants

**Files:**
- Create: `packages/karm/src/board/board-types.ts`
- Create: `packages/karm/src/board/board-constants.ts`
- Modify: `packages/karm/src/board/index.ts` (re-export types)

**Step 1: Create board-types.ts**

```typescript
// packages/karm/src/board/board-types.ts

export interface BoardTask {
  id: string
  taskId: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  labels: string[]
  dueDate: string | null
  isBlocked: boolean
  visibility: 'INTERNAL' | 'EVERYONE'
  owner: BoardMember | null
  assignees: BoardMember[]
  subtaskCount: number
  subtasksDone: number
}

export interface BoardMember {
  id: string
  name: string
  image: string | null
}

export interface BoardColumn {
  id: string
  name: string
  isClientVisible?: boolean
  wipLimit?: number
  tasks: BoardTask[]
}

export interface BoardData {
  columns: BoardColumn[]
}

export interface BoardFilters {
  search: string
  assignees: string[]
  priorities: string[]
  labels: string[]
  dueDateRange: 'overdue' | 'today' | 'this-week' | 'none' | null
}

export type BoardViewMode = 'default' | 'compact'

export interface BulkAction {
  type: 'move' | 'priority' | 'assign' | 'label' | 'dueDate' | 'delete' | 'visibility'
  taskIds: string[]
  value?: string | null
}
```

**Step 2: Create board-constants.ts**

```typescript
// packages/karm/src/board/board-constants.ts

export const COLUMN_WIDTH = 320

export const COLUMN_ACCENT_COLORS = [
  'bg-category-cyan',
  'bg-category-amber',
  'bg-category-teal',
  'bg-category-indigo',
  'bg-category-orange',
  'bg-category-emerald',
  'bg-category-slate',
  'bg-accent',
] as const

export const PRIORITY_ICONS = {
  LOW: 'IconArrowDown',
  MEDIUM: 'IconArrowRight',
  HIGH: 'IconArrowUp',
  URGENT: 'IconAlertTriangle',
} as const

export const PRIORITY_COLORS = {
  LOW: 'text-text-tertiary',
  MEDIUM: 'text-warning',
  HIGH: 'text-error',
  URGENT: 'text-error',
} as const

export const DEFAULT_FILTERS: BoardFilters = {
  search: '',
  assignees: [],
  priorities: [],
  labels: [],
  dueDateRange: null,
}
```

**Step 3: Update barrel export**

Add to `packages/karm/src/board/index.ts`:
```typescript
export type {
  BoardTask, BoardMember, BoardColumn, BoardData,
  BoardFilters, BoardViewMode, BulkAction,
} from './board-types'
```

**Step 4: Commit**
```bash
git add packages/karm/src/board/board-types.ts packages/karm/src/board/board-constants.ts packages/karm/src/board/index.ts
git commit -m "feat(board): add enriched types and constants for board rework"
```

---

## Task 2: BoardProvider Context

**Files:**
- Create: `packages/karm/src/board/board-context.tsx`
- Create: `packages/karm/src/board/use-board-filters.ts`
- Test: `packages/karm/src/board/__tests__/board-context.test.tsx`

**Step 1: Write failing test for BoardProvider**

```typescript
// packages/karm/src/board/__tests__/board-context.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardProvider, useBoardContext } from '../board-context'
import type { BoardData } from '../board-types'

const mockData: BoardData = {
  columns: [
    { id: 'col-1', name: 'Todo', tasks: [] },
    { id: 'col-2', name: 'Done', tasks: [] },
  ],
}

function TestConsumer() {
  const ctx = useBoardContext()
  return (
    <div>
      <span data-testid="column-count">{ctx.columns.length}</span>
      <span data-testid="view-mode">{ctx.viewMode}</span>
      <span data-testid="has-filters">{String(ctx.hasActiveFilters)}</span>
      <span data-testid="selected-count">{ctx.selectedTaskIds.size}</span>
    </div>
  )
}

describe('BoardProvider', () => {
  it('provides default context values', () => {
    render(
      <BoardProvider initialData={mockData}>
        <TestConsumer />
      </BoardProvider>
    )
    expect(screen.getByTestId('column-count')).toHaveTextContent('2')
    expect(screen.getByTestId('view-mode')).toHaveTextContent('default')
    expect(screen.getByTestId('has-filters')).toHaveTextContent('false')
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0')
  })

  it('throws when useBoardContext used outside provider', () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow()
    spy.mockRestore()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/karm && npx vitest run src/board/__tests__/board-context.test.tsx
```
Expected: FAIL — module not found

**Step 3: Implement use-board-filters.ts**

```typescript
// packages/karm/src/board/use-board-filters.ts
import { useMemo } from 'react'
import type { BoardColumn, BoardFilters, BoardTask } from './board-types'

function matchesFilters(task: BoardTask, filters: BoardFilters): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase()
    if (!task.title.toLowerCase().includes(q) && !task.taskId.toLowerCase().includes(q)) {
      return false
    }
  }
  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false
  }
  if (filters.assignees.length > 0) {
    const taskUserIds = [
      ...(task.owner ? [task.owner.id] : []),
      ...task.assignees.map((a) => a.id),
    ]
    if (!filters.assignees.some((id) => taskUserIds.includes(id))) return false
  }
  if (filters.labels.length > 0) {
    if (!filters.labels.some((l) => task.labels.includes(l))) return false
  }
  if (filters.dueDateRange && filters.dueDateRange !== 'none') {
    if (!task.dueDate) return false
    const due = new Date(task.dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    switch (filters.dueDateRange) {
      case 'overdue':
        if (due >= now) return false
        break
      case 'today':
        if (due < now || due > endOfToday) return false
        break
      case 'this-week': {
        const endOfWeek = new Date(now)
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
        endOfWeek.setHours(23, 59, 59, 999)
        if (due > endOfWeek) return false
        break
      }
    }
  }
  return true
}

export function useFilteredColumns(
  columns: BoardColumn[],
  filters: BoardFilters,
): BoardColumn[] {
  return useMemo(() => {
    const hasFilters =
      filters.search !== '' ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0 ||
      filters.labels.length > 0 ||
      (filters.dueDateRange != null && filters.dueDateRange !== 'none')

    if (!hasFilters) return columns

    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => matchesFilters(t, filters)),
    }))
  }, [columns, filters])
}
```

**Step 4: Implement board-context.tsx**

```typescript
// packages/karm/src/board/board-context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type {
  BoardColumn,
  BoardData,
  BoardFilters,
  BoardTask,
  BoardViewMode,
  BulkAction,
} from './board-types'
import { DEFAULT_FILTERS } from './board-constants'
import { useFilteredColumns } from './use-board-filters'

interface BoardContextValue {
  // Data (filtered)
  columns: BoardColumn[]
  // Raw data (unfiltered — for internal use like selectAll)
  rawColumns: BoardColumn[]

  // View
  viewMode: BoardViewMode
  setViewMode: (mode: BoardViewMode) => void

  // Filters
  filters: BoardFilters
  setFilters: (updates: Partial<BoardFilters>) => void
  clearFilters: () => void
  hasActiveFilters: boolean

  // Selection
  selectedTaskIds: Set<string>
  toggleTaskSelection: (taskId: string) => void
  selectRange: (fromId: string, toId: string) => void
  selectAll: () => void
  clearSelection: () => void

  // Keyboard
  focusedTaskId: string | null
  setFocusedTaskId: (id: string | null) => void

  // My tasks highlight
  currentUserId: string | null
  highlightMyTasks: boolean
  setHighlightMyTasks: (on: boolean) => void

  // DnD
  activeTask: BoardTask | null
  setActiveTask: (task: BoardTask | null) => void

  // Callbacks
  onTaskMove: (taskId: string, toColumnId: string, newOrder: number) => void
  onTaskAdd: (columnId: string, title: string) => void
  onBulkAction: (action: BulkAction) => void
  onColumnReorder: (columnId: string, newIndex: number) => void
  onColumnRename: (columnId: string, name: string) => void
  onColumnDelete: (columnId: string) => void
  onColumnToggleVisibility: (columnId: string, visible: boolean) => void
  onColumnWipLimitChange: (columnId: string, limit: number | null) => void
  onClickTask: (taskId: string) => void
  onAddColumn: () => void

  // Quick actions
  onQuickPriorityChange: (taskId: string, priority: string) => void
  onQuickAssign: (taskId: string, userId: string) => void
  onQuickDueDateChange: (taskId: string, date: string | null) => void
  onQuickLabelAdd: (taskId: string, label: string) => void
  onQuickVisibilityChange: (taskId: string, visibility: string) => void
  onQuickDelete: (taskId: string) => void
}

const BoardContext = createContext<BoardContextValue | null>(null)

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext)
  if (!ctx) throw new Error('useBoardContext must be used within <BoardProvider>')
  return ctx
}

const noop = () => {}

export interface BoardProviderProps {
  initialData: BoardData
  currentUserId?: string | null
  children: ReactNode
  onTaskMove?: (taskId: string, toColumnId: string, newOrder: number) => void
  onTaskAdd?: (columnId: string, title: string) => void
  onBulkAction?: (action: BulkAction) => void
  onColumnReorder?: (columnId: string, newIndex: number) => void
  onColumnRename?: (columnId: string, name: string) => void
  onColumnDelete?: (columnId: string) => void
  onColumnToggleVisibility?: (columnId: string, visible: boolean) => void
  onColumnWipLimitChange?: (columnId: string, limit: number | null) => void
  onClickTask?: (taskId: string) => void
  onAddColumn?: () => void
  onQuickPriorityChange?: (taskId: string, priority: string) => void
  onQuickAssign?: (taskId: string, userId: string) => void
  onQuickDueDateChange?: (taskId: string, date: string | null) => void
  onQuickLabelAdd?: (taskId: string, label: string) => void
  onQuickVisibilityChange?: (taskId: string, visibility: string) => void
  onQuickDelete?: (taskId: string) => void
}

export function BoardProvider({ initialData, currentUserId = null, children, ...callbacks }: BoardProviderProps) {
  // Sync external data
  const [columns, setColumns] = useState<BoardColumn[]>(initialData.columns)
  useEffect(() => { setColumns(initialData.columns) }, [initialData])

  // View mode
  const [viewMode, setViewMode] = useState<BoardViewMode>('default')

  // Filters
  const [filters, setFiltersState] = useState<BoardFilters>(DEFAULT_FILTERS)
  const setFilters = useCallback((updates: Partial<BoardFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }))
  }, [])
  const clearFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), [])
  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0 ||
      filters.labels.length > 0 ||
      (filters.dueDateRange != null && filters.dueDateRange !== 'none'),
    [filters],
  )

  // Filtered columns
  const filteredColumns = useFilteredColumns(columns, filters)

  // Selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }, [])
  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const allTasks = columns.flatMap((c) => c.tasks)
      const fromIdx = allTasks.findIndex((t) => t.id === fromId)
      const toIdx = allTasks.findIndex((t) => t.id === toId)
      if (fromIdx === -1 || toIdx === -1) return
      const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx]
      const rangeIds = allTasks.slice(start, end + 1).map((t) => t.id)
      setSelectedTaskIds((prev) => {
        const next = new Set(prev)
        rangeIds.forEach((id) => next.add(id))
        return next
      })
    },
    [columns],
  )
  const selectAll = useCallback(() => {
    const allIds = filteredColumns.flatMap((c) => c.tasks.map((t) => t.id))
    setSelectedTaskIds(new Set(allIds))
  }, [filteredColumns])
  const clearSelection = useCallback(() => setSelectedTaskIds(new Set()), [])

  // Keyboard focus
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)

  // My tasks
  const [highlightMyTasks, setHighlightMyTasks] = useState(false)

  // DnD
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)

  const value = useMemo<BoardContextValue>(
    () => ({
      columns: filteredColumns,
      rawColumns: columns,
      viewMode,
      setViewMode,
      filters,
      setFilters,
      clearFilters,
      hasActiveFilters,
      selectedTaskIds,
      toggleTaskSelection,
      selectRange,
      selectAll,
      clearSelection,
      focusedTaskId,
      setFocusedTaskId,
      currentUserId,
      highlightMyTasks,
      setHighlightMyTasks,
      activeTask,
      setActiveTask,
      onTaskMove: callbacks.onTaskMove ?? noop,
      onTaskAdd: callbacks.onTaskAdd ?? noop,
      onBulkAction: callbacks.onBulkAction ?? noop,
      onColumnReorder: callbacks.onColumnReorder ?? noop,
      onColumnRename: callbacks.onColumnRename ?? noop,
      onColumnDelete: callbacks.onColumnDelete ?? noop,
      onColumnToggleVisibility: callbacks.onColumnToggleVisibility ?? noop,
      onColumnWipLimitChange: callbacks.onColumnWipLimitChange ?? noop,
      onClickTask: callbacks.onClickTask ?? noop,
      onAddColumn: callbacks.onAddColumn ?? noop,
      onQuickPriorityChange: callbacks.onQuickPriorityChange ?? noop,
      onQuickAssign: callbacks.onQuickAssign ?? noop,
      onQuickDueDateChange: callbacks.onQuickDueDateChange ?? noop,
      onQuickLabelAdd: callbacks.onQuickLabelAdd ?? noop,
      onQuickVisibilityChange: callbacks.onQuickVisibilityChange ?? noop,
      onQuickDelete: callbacks.onQuickDelete ?? noop,
    }),
    [
      filteredColumns, columns, viewMode, filters, setFilters, clearFilters,
      hasActiveFilters, selectedTaskIds, toggleTaskSelection, selectRange,
      selectAll, clearSelection, focusedTaskId, currentUserId, highlightMyTasks,
      activeTask, callbacks,
    ],
  )

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
```

**Step 5: Run tests**
```bash
cd packages/karm && npx vitest run src/board/__tests__/board-context.test.tsx
```
Expected: PASS

**Step 6: Commit**
```bash
git add packages/karm/src/board/board-context.tsx packages/karm/src/board/use-board-filters.ts packages/karm/src/board/__tests__/board-context.test.tsx
git commit -m "feat(board): add BoardProvider context with filters, selection, keyboard focus"
```

---

## 🔍 CHECKPOINT 1: Review types, constants, and context

Show user: `board-types.ts`, `board-constants.ts`, `board-context.tsx`, `use-board-filters.ts`
User approves before continuing.

---

## Task 3: TaskCard — Default Mode

The visual centerpiece. Build the enriched default card.

**Files:**
- Rewrite: `packages/karm/src/board/task-card.tsx`
- Test: `packages/karm/src/board/__tests__/task-card.test.tsx` (rewrite)

**Step 1: Write failing tests**

```typescript
// packages/karm/src/board/__tests__/task-card.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { TaskCard } from '../task-card'
import { BoardProvider } from '../board-context'
import type { BoardTask, BoardData } from '../board-types'

const mockTask: BoardTask = {
  id: '1',
  taskId: 'KRM-42',
  title: 'Implement authentication flow',
  priority: 'HIGH',
  labels: ['frontend', 'auth'],
  dueDate: new Date().toISOString(), // today
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: { id: 'u1', name: 'Alice', image: null },
  assignees: [{ id: 'u2', name: 'Bob', image: null }],
  subtaskCount: 5,
  subtasksDone: 3,
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [mockTask] }] }}>
    {children}
  </BoardProvider>
)

describe('TaskCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<TaskCard task={mockTask} />, { wrapper })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders task ID', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('KRM-42')).toBeInTheDocument()
  })

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('Implement authentication flow')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('renders subtask progress', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('renders owner avatar', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('A')).toBeInTheDocument() // Alice initials
  })

  it('renders blocked indicator when blocked', () => {
    const blockedTask = { ...mockTask, isBlocked: true }
    render(<TaskCard task={blockedTask} />, { wrapper })
    expect(screen.getByLabelText('Blocked')).toBeInTheDocument()
  })

  it('renders visibility badge when EVERYONE', () => {
    const publicTask = { ...mockTask, visibility: 'EVERYONE' as const }
    render(<TaskCard task={publicTask} />, { wrapper })
    expect(screen.getByLabelText('Client visible')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**
```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx
```

**Step 3: Implement TaskCard**

Rewrite `packages/karm/src/board/task-card.tsx` with:

- CVA variants: `state` (default/dragging/overlay), `blocked` (true/false), `selected` (true/false), `dimmed` (true/false)
- Layout: vertical stack with `p-ds-03` padding inside `rounded-lg` card
- Top row: checkbox (conditional), task ID badge (`text-xs font-mono text-text-tertiary`), priority icon (colored per PRIORITY_COLORS)
- Title: `text-sm font-medium text-text-primary line-clamp-2`
- Labels row: up to 3 chips (`text-xs bg-layer-02 rounded-full px-ds-02 py-ds-01`), +N overflow
- Subtask progress: `Progress` component from core (small size) + `3/5` text
- Bottom row: due date badge (with overdue/today/tomorrow coloring), visibility eye icon (if EVERYONE), blocked lock icon (if blocked), spacer, owner avatar (with `ring-2 ring-accent` to distinguish), assignee avatars
- Selection checkbox: visible on hover OR when any card in board is selected (read from context)
- Dimmed when `highlightMyTasks` is on and task doesn't belong to `currentUserId`
- `useSortable()` from @dnd-kit for drag
- Export `TaskCardOverlay` for portal drag overlay (same card with overlay CVA state + `backdrop-blur-sm`)

Use `cn()` from `@/ui/lib/utils` for all class merging. Use semantic tokens only.

**Step 4: Run tests**
```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx
```

**Step 5: Commit**
```bash
git commit -m "feat(board): rewrite TaskCard with enriched data, selection, and glassmorphism"
```

---

## Task 4: TaskCardCompact

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx` (add TaskCardCompact export)
- Test: `packages/karm/src/board/__tests__/task-card.test.tsx` (add compact tests)

**Step 1: Add failing tests for compact mode**

```typescript
describe('TaskCardCompact', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<TaskCardCompact task={mockTask} />, { wrapper })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders task ID inline', () => {
    render(<TaskCardCompact task={mockTask} />, { wrapper })
    expect(screen.getByText('KRM-42')).toBeInTheDocument()
  })

  it('renders title with single line clamp', () => {
    render(<TaskCardCompact task={mockTask} />, { wrapper })
    const title = screen.getByText('Implement authentication flow')
    expect(title).toHaveClass('line-clamp-1')
  })

  it('renders subtask count as text only', () => {
    render(<TaskCardCompact task={mockTask} />, { wrapper })
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })
})
```

**Step 2: Implement TaskCardCompact**

Single horizontal row: `py-ds-02 px-ds-03`, no shadow, `border-b border-border-subtle`
Layout: checkbox | priority icon | task ID (muted) | title (1-line clamp, flex-1) | subtask count text | owner avatar (small)

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add TaskCardCompact for dense view mode"
```

---

## 🔍 CHECKPOINT 2: Review card components

Show user both card modes in Storybook (create temporary stories). User approves visual design before continuing.

---

## Task 5: ColumnHeader

**Files:**
- Create: `packages/karm/src/board/column-header.tsx`
- Test: `packages/karm/src/board/__tests__/column-header.test.tsx`

**Step 1: Write failing tests**

Test: renders column name, accent dot, task count, WIP indicator (normal + exceeded), avatar stack, column menu (rename, WIP limit, visibility, delete). Axe audit.

**Step 2: Implement ColumnHeader**

- Accent dot: small `w-2.5 h-2.5 rounded-full` circle, color from `COLUMN_ACCENT_COLORS[index % 8]`
- Column name: `text-sm font-semibold text-text-primary`, double-click to edit (inline input)
- Task count: `text-xs text-text-tertiary` badge, turns `text-error font-semibold` when WIP exceeded
- WIP format: `3/5` (tasks/limit) or just `3` (no limit)
- Avatar stack: `AvatarGroup` from core, shows unique assignees/owners across all tasks in column, max 3
- Menu: `DropdownMenu` from core — Rename, Set WIP Limit, Toggle Visibility, Separator, Delete (destructive)
- Add task button: `+` icon, hover-visible, calls `onTaskAdd` with inline input

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add ColumnHeader with accent dot, WIP limits, avatar stack"
```

---

## Task 6: BoardColumn (rewrite)

**Files:**
- Rewrite: `packages/karm/src/board/board-column.tsx`
- Test: `packages/karm/src/board/__tests__/board-column.test.tsx` (rewrite)

**Step 1: Write failing tests**

Test: renders ColumnHeader, renders tasks (default or compact based on viewMode from context), droppable area, empty state, WIP exceeded styling. Axe audit.

**Step 2: Implement BoardColumn**

- Container: `w-[320px] flex-shrink-0 rounded-xl bg-field/50 backdrop-blur-[2px]`
- Uses `useDroppable()` for drop target
- Uses `useSortable()` for column reordering (wraps entire column)
- Reads `viewMode` from context, renders `TaskCard` or `TaskCardCompact`
- Drop hover: `bg-interactive-subtle/30` transition
- WIP exceeded: column gets `bg-error-surface/50` tint
- Quick-add input at bottom (same as before but styled to match new design)

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): rewrite BoardColumn with glass bg, WIP states, view modes"
```

---

## Task 7: ColumnEmpty — Empty State

**Files:**
- Create: `packages/karm/src/board/column-empty.tsx`
- Test: `packages/karm/src/board/__tests__/column-empty.test.tsx`

**Step 1: Write failing tests**

Test: renders illustration, "No tasks yet" text, "Add a task" button. Axe audit.

**Step 2: Implement ColumnEmpty**

- Minimal SVG line-art illustrations (4 variants, cycling by column index)
- Simple geometric/abstract shapes using `stroke-text-quaternary` (e.g., empty clipboard, stacked cards, checkmark circle, arrow-into-box)
- Inline SVG (no external assets)
- Text: `text-sm text-text-tertiary`
- Button: `Button` from core, variant ghost, size sm

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add ColumnEmpty with line-art illustrations"
```

---

## 🔍 CHECKPOINT 3: Review column components

Show user: ColumnHeader, BoardColumn, ColumnEmpty in Storybook. User approves before continuing.

---

## Task 8: BoardToolbar

**Files:**
- Create: `packages/karm/src/board/board-toolbar.tsx`
- Test: `packages/karm/src/board/__tests__/board-toolbar.test.tsx`

**Step 1: Write failing tests**

Test: renders search input, filter dropdowns, view toggle, my-tasks toggle. Search filters tasks (via context). Filter chips appear when active. Clear all button. Axe audit.

**Step 2: Implement BoardToolbar**

- Container: `sticky top-0 z-[1100] bg-background/80 backdrop-blur-md border-b border-border-subtle p-ds-03`
- Search: `SearchInput` from core (if available) or `Input` with `IconSearch` prefix, `placeholder="Search tasks... (⌘K)"`, debounced 200ms, writes to `filters.search` in context
- Filter dropdowns: `DropdownMenu` from core for each filter type:
  - Priority: checkbox items for LOW/MEDIUM/HIGH/URGENT
  - Assignee: checkbox items listing all unique assignees across board
  - Label: checkbox items listing all unique labels
  - Due Date: radio items for overdue/today/this-week/none
- Active filter chips: row of `Badge` from core (removable variant with X), each removes one filter
- "Clear all" link when `hasActiveFilters`
- View toggle: `SegmentedControl` or `ToggleGroup` from core — two icons (grid = default, list = compact)
- My tasks toggle: `IconButton` from core with `IconUser` — active state highlighted with `bg-accent-subtle`

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add BoardToolbar with search, filters, view toggle"
```

---

## Task 9: BulkActionBar

**Files:**
- Create: `packages/karm/src/board/bulk-action-bar.tsx`
- Test: `packages/karm/src/board/__tests__/bulk-action-bar.test.tsx`

**Step 1: Write failing tests**

Test: hidden when no selection, shows count when tasks selected, renders action buttons, clear selection button. Axe audit.

**Step 2: Implement BulkActionBar**

- Slides down from toolbar when `selectedTaskIds.size > 0`
- Same glass style: `bg-background/80 backdrop-blur-md`
- Left: `"N selected"` text + clear (X) button
- Center/Right: action buttons — Move to (dropdown of columns), Priority (dropdown), Assign (dropdown), Label (dropdown), Due Date (popover with date input), Visibility (dropdown), Delete (confirm dialog)
- Each action calls `onBulkAction` with type + selected IDs + value
- After action, clears selection

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add BulkActionBar for multi-task operations"
```

---

## 🔍 CHECKPOINT 4: Review toolbar and bulk actions

Show user: BoardToolbar + BulkActionBar in Storybook. User approves before continuing.

---

## Task 10: Task Context Menu (right-click)

**Files:**
- Create: `packages/karm/src/board/task-context-menu.tsx`
- Test: `packages/karm/src/board/__tests__/task-context-menu.test.tsx`

**Step 1: Write failing tests**

Test: renders all menu items (priority submenu, assign, label, due date, visibility, delete). Axe audit.

**Step 2: Implement TaskContextMenu**

- Uses `ContextMenu` from core (`ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`, `ContextMenuItem`, `ContextMenuSeparator`)
- Wraps each TaskCard / TaskCardCompact
- Submenu: Set Priority → LOW/MEDIUM/HIGH/URGENT (with colored icons)
- Submenu: Assign → list of members (from context's rawColumns → unique members)
- Submenu: Add Label → list of all labels + free text input
- Item: Set Due Date → triggers a date picker popover
- Submenu: Visibility → INTERNAL / EVERYONE
- Separator
- Item: Delete (destructive red text)
- Also renders `...` button on card hover for touch/a11y — triggers same `DropdownMenu`

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add TaskContextMenu with right-click and hover actions"
```

---

## Task 11: Keyboard Navigation

**Files:**
- Create: `packages/karm/src/board/use-board-keyboard.ts`
- Test: `packages/karm/src/board/__tests__/use-board-keyboard.test.tsx`

**Step 1: Write failing tests**

Test: arrow up/down moves focus within column, arrow left/right moves across columns, Enter calls onClickTask, Space toggles selection, Shift+Arrow extends selection, Escape clears selection then filters, `/` focuses search.

**Step 2: Implement use-board-keyboard.ts**

- Hook that attaches `keydown` listener to board container ref
- Reads `columns`, `focusedTaskId`, `selectedTaskIds` from context
- Computes a 2D grid of task IDs (column × row) for navigation
- Arrow keys: update `focusedTaskId` in context, scroll focused card into view
- Enter: `onClickTask(focusedTaskId)`
- Space: `toggleTaskSelection(focusedTaskId)`
- Shift+Arrow: `selectRange(lastSelectedId, newFocusId)`
- Escape: first press clears selection, second press clears filters
- `/`: focuses search input (by ref or id)
- Focused card gets `ring-2 ring-accent` dashed outline (read focusedTaskId in TaskCard and apply class)

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): add keyboard navigation hook"
```

---

## 🔍 CHECKPOINT 5: Review context menu and keyboard navigation

Interactive demo. User tests keyboard nav and right-click in Storybook. Approves before continuing.

---

## Task 12: KanbanBoard (rewrite — orchestrator)

**Files:**
- Rewrite: `packages/karm/src/board/kanban-board.tsx`
- Test: `packages/karm/src/board/__tests__/kanban-board.test.tsx` (rewrite)

**Step 1: Write failing tests**

Test: renders BoardToolbar + columns + add column button, DnD context works (drag start/over/end), column reordering, passes callbacks through context. Axe audit.

**Step 2: Implement KanbanBoard**

- Wraps everything in `BoardProvider`
- Inside provider: `BoardToolbar` (sticky top) + `BulkActionBar` + `BoardCanvas`
- `BoardCanvas`: horizontal scroll container with `DndContext` + `SortableContext` (for column reorder)
- Sensors: same as before (pointer 5px, touch 200ms, keyboard)
- Column SortableContext: `horizontalListSortingStrategy`, renders `BoardColumn` for each filtered column
- `DragOverlay` in portal: renders `TaskCard` or `TaskCardCompact` (based on viewMode) with overlay state
- DnD handlers: same optimistic logic as current implementation, but reads/writes through context
- `useBoardKeyboard` hook attached to canvas container ref
- Add column button: dashed border, `+` icon, `w-[320px]`

**Step 3: Run tests, commit**
```bash
git commit -m "feat(board): rewrite KanbanBoard as orchestrator with BoardProvider"
```

---

## Task 13: Storybook Stories

**Files:**
- Rewrite: `packages/karm/src/board/kanban-board.stories.tsx`
- Rewrite: `packages/karm/src/board/board-column.stories.tsx`
- Rewrite: `packages/karm/src/board/task-card.stories.tsx`

**Stories to write:**

**KanbanBoard:**
- `FullBoard` — 5 columns, realistic tasks with all data fields, various priorities/labels/subtasks
- `WithWipLimits` — columns with WIP limits, one exceeded
- `CompactView` — starts in compact mode
- `WithFiltersActive` — pre-applied filter showing filtered state
- `EmptyBoard` — no columns
- `SingleColumn` — one column with mixed tasks
- `HeavyBoard` — 8+ columns, 50+ tasks (perf test + scroll test)

**BoardColumn:**
- `Default` — normal column with tasks
- `WipExceeded` — red dot, tinted background
- `Empty` — shows empty state illustration
- `CompactMode` — compact card rendering

**TaskCard:**
- `Default` — all fields populated
- `Compact` — compact variant
- `Blocked` — red border + lock icon
- `ClientVisible` — visibility badge
- `Minimal` — only required fields
- `WithSubtaskProgress` — various progress levels
- `AllPriorities` — side-by-side comparison
- `Selected` — selected state with ring
- `Dimmed` — my-tasks dimmed state
- `DragOverlay` — overlay variant with glass

**Step: Commit**
```bash
git commit -m "feat(board): rewrite Storybook stories for board rework"
```

---

## 🔍 CHECKPOINT 6: Full visual review

User reviews entire board in Storybook — all stories, all states. This is the major design approval gate.

---

## Task 14: Update Exports & Types

**Files:**
- Rewrite: `packages/karm/src/board/index.ts`

**New exports:**

```typescript
// Types
export type {
  BoardTask, BoardMember, BoardColumn, BoardData,
  BoardFilters, BoardViewMode, BulkAction,
} from './board-types'

// Components
export { KanbanBoard } from './kanban-board'
export type { KanbanBoardProps } from './kanban-board'
export { BoardProvider, useBoardContext } from './board-context'
export type { BoardProviderProps } from './board-context'
export { TaskCard, TaskCardCompact, TaskCardOverlay } from './task-card'
export type { TaskCardProps } from './task-card'
```

Note: `BoardColumn`, `ColumnHeader`, `ColumnEmpty`, `BoardToolbar`, `BulkActionBar`, `TaskContextMenu` are internal — not exported. Consumers only use `KanbanBoard` (which composes everything) or individual cards if they need custom layouts.

**Step: Commit**
```bash
git commit -m "feat(board): update board exports for new architecture"
```

---

## Task 15: Cleanup & Delete Old Code

**Files:**
- Delete old `task-constants.ts` references if superseded by `board-constants.ts`
- Remove any dead imports or unused helpers from old implementation
- Verify no other karm modules import from old board internals

**Step: Commit**
```bash
git commit -m "chore(board): clean up old board implementation artifacts"
```

---

## Task 16: Full Test Suite Run

**Steps:**
1. `pnpm typecheck` — verify no type errors
2. `pnpm test` — all tests pass (board + everything else)
3. `pnpm build` — builds successfully
4. `pnpm lint` — no lint errors

Fix any issues found.

**Step: Commit any fixes**
```bash
git commit -m "fix(board): resolve typecheck/test/build issues from board rework"
```

---

## 🔍 CHECKPOINT 7: Final review

User confirms: types pass, tests pass, build works, Storybook looks right. Ready for version bump + publish cycle.

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Types & constants | board-types.ts, board-constants.ts |
| 2 | BoardProvider context | board-context.tsx, use-board-filters.ts |
| 3 | TaskCard default | task-card.tsx (rewrite) |
| 4 | TaskCardCompact | task-card.tsx (addition) |
| 5 | ColumnHeader | column-header.tsx (new) |
| 6 | BoardColumn | board-column.tsx (rewrite) |
| 7 | ColumnEmpty | column-empty.tsx (new) |
| 8 | BoardToolbar | board-toolbar.tsx (new) |
| 9 | BulkActionBar | bulk-action-bar.tsx (new) |
| 10 | TaskContextMenu | task-context-menu.tsx (new) |
| 11 | Keyboard navigation | use-board-keyboard.ts (new) |
| 12 | KanbanBoard orchestrator | kanban-board.tsx (rewrite) |
| 13 | Storybook stories | *.stories.tsx (rewrite) |
| 14 | Exports | index.ts (rewrite) |
| 15 | Cleanup | remove dead code |
| 16 | Full test suite | typecheck + test + build + lint |
