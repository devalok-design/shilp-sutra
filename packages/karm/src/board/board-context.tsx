'use client'

// packages/karm/src/board/board-context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type {
  BoardColumn,
  BoardData,
  BoardFilters,
  BoardMember,
  BoardTask,
  BoardViewMode,
  BulkAction,
  NewTaskOptions,
} from './board-types'
import { DEFAULT_FILTERS } from './board-constants'
import { collectAllMembers } from './board-utils'
import { useFilteredColumns } from './use-board-filters'

interface BoardContextValue {
  columns: BoardColumn[]
  rawColumns: BoardColumn[]
  members: BoardMember[]
  readOnly: boolean
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
  // Completed column toggle (K12)
  completedColumnId: string | undefined
  showCompleted: boolean
  onToggleCompleted: (show: boolean) => void
  // Mobile view (K11)
  mobileView: 'scroll' | 'list'
  mobileBreakpoint: 'sm' | 'md'
  isMobileListView: boolean
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
  onAddTask: (columnId: string) => void
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

const BREAKPOINTS = { sm: 640, md: 768 } as const

/** Returns true when viewport is below the given breakpoint. SSR-safe (returns false). */
function useBelowBreakpoint(bp: 'sm' | 'md'): boolean {
  const query = `(max-width: ${BREAKPOINTS[bp] - 1}px)`
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    [query],
  )
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => false, [])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export interface BoardProviderProps {
  initialData: BoardData
  currentUserId?: string | null
  /** Explicit member list for assignment dropdowns. Falls back to deriving from task assignees. */
  members?: BoardMember[]
  children: ReactNode

  /** When true, disables DnD, column management, task selection, and add buttons. */
  readOnly?: boolean

  /** Initial view mode for task cards. Default: 'default'. */
  defaultViewMode?: BoardViewMode

  // ---- Completed column toggle (K12) ----
  /** Column ID to treat as the "completed" column */
  completedColumnId?: string
  /** Whether the completed column's tasks are visible */
  showCompleted?: boolean
  /** Called when the user toggles completed column visibility */
  onToggleCompleted?: (show: boolean) => void

  // ---- Mobile view (K11) ----
  /** Mobile layout mode: 'scroll' keeps horizontal scroll, 'list' renders grouped flat list */
  mobileView?: 'scroll' | 'list'
  /** Breakpoint below which mobile view activates */
  mobileBreakpoint?: 'sm' | 'md'

  onTaskMove?: (taskId: string, toColumnId: string, newOrder: number) => void
  onTaskAdd?: (columnId: string, options: NewTaskOptions) => void
  onBulkAction?: (action: BulkAction) => void
  onColumnReorder?: (columnId: string, newIndex: number) => void
  onColumnRename?: (columnId: string, name: string) => void
  onColumnDelete?: (columnId: string) => void
  onColumnToggleVisibility?: (columnId: string, visible: boolean) => void
  onColumnWipLimitChange?: (columnId: string, limit: number | null) => void
  onClickTask?: (taskId: string) => void
  onAddColumn?: () => void
  /** Called when user clicks "Add a task" in an empty column. Receives the column ID. */
  onAddTask?: (columnId: string) => void
  onQuickPriorityChange?: (taskId: string, priority: string) => void
  onQuickAssign?: (taskId: string, userId: string) => void
  onQuickDueDateChange?: (taskId: string, date: string | null) => void
  onQuickLabelAdd?: (taskId: string, label: string) => void
  onQuickVisibilityChange?: (taskId: string, visibility: string) => void
  onQuickDelete?: (taskId: string) => void
}

export function BoardProvider({
  initialData,
  currentUserId = null,
  members: membersProp,
  children,
  readOnly = false,
  defaultViewMode = 'default',
  completedColumnId,
  showCompleted = true,
  onToggleCompleted,
  mobileView = 'scroll',
  mobileBreakpoint = 'md',
  onTaskMove,
  onTaskAdd,
  onBulkAction,
  onColumnReorder,
  onColumnRename,
  onColumnDelete,
  onColumnToggleVisibility,
  onColumnWipLimitChange,
  onClickTask,
  onAddColumn,
  onAddTask,
  onQuickPriorityChange,
  onQuickAssign,
  onQuickDueDateChange,
  onQuickLabelAdd,
  onQuickVisibilityChange,
  onQuickDelete,
}: BoardProviderProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialData.columns)
  useEffect(() => {
    setColumns(initialData.columns)
  }, [initialData])

  const [viewMode, setViewMode] = useState<BoardViewMode>(defaultViewMode)

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

  const filteredColumns = useFilteredColumns(columns, filters)

  const resolvedMembers = useMemo(
    () => membersProp ?? collectAllMembers(columns),
    [membersProp, columns],
  )

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
      const allTasks = filteredColumns.flatMap((c) => c.tasks)
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
    [filteredColumns],
  )
  const selectAll = useCallback(() => {
    const allIds = filteredColumns.flatMap((c) => c.tasks.map((t) => t.id))
    setSelectedTaskIds(new Set(allIds))
  }, [filteredColumns])
  const clearSelection = useCallback(() => setSelectedTaskIds(new Set()), [])

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  const [highlightMyTasks, setHighlightMyTasks] = useState(false)
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)

  // Mobile list view detection (K11)
  const isBelowBreakpoint = useBelowBreakpoint(mobileBreakpoint)
  const isMobileListView = mobileView === 'list' && isBelowBreakpoint

  const value = useMemo<BoardContextValue>(
    () => ({
      columns: filteredColumns,
      rawColumns: columns,
      members: resolvedMembers,
      readOnly,
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
      completedColumnId,
      showCompleted,
      onToggleCompleted: onToggleCompleted ?? noop,
      mobileView,
      mobileBreakpoint,
      isMobileListView,
      onTaskMove: onTaskMove
        ? (taskId: string, toColumnId: string, newOrder: number) => {
            // Optimistic local update — move task in state before notifying consumer
            setColumns((prev) => {
              let task: BoardTask | undefined
              const without = prev.map((col) => {
                const idx = col.tasks.findIndex((t) => t.id === taskId)
                if (idx === -1) return col
                task = col.tasks[idx]
                return { ...col, tasks: [...col.tasks.slice(0, idx), ...col.tasks.slice(idx + 1)] }
              })
              if (!task) return prev
              return without.map((col) => {
                if (col.id !== toColumnId) return col
                const tasks = [...col.tasks]
                tasks.splice(Math.min(newOrder, tasks.length), 0, task!)
                return { ...col, tasks }
              })
            })
            onTaskMove(taskId, toColumnId, newOrder)
          }
        : noop,
      onTaskAdd: onTaskAdd ?? noop,
      onBulkAction: onBulkAction ?? noop,
      onColumnReorder: onColumnReorder ?? noop,
      onColumnRename: onColumnRename ?? noop,
      onColumnDelete: onColumnDelete ?? noop,
      onColumnToggleVisibility: onColumnToggleVisibility ?? noop,
      onColumnWipLimitChange: onColumnWipLimitChange ?? noop,
      onClickTask: onClickTask ?? noop,
      onAddColumn: onAddColumn ?? noop,
      onAddTask: onAddTask ?? noop,
      onQuickPriorityChange: onQuickPriorityChange ?? noop,
      onQuickAssign: onQuickAssign ?? noop,
      onQuickDueDateChange: onQuickDueDateChange ?? noop,
      onQuickLabelAdd: onQuickLabelAdd ?? noop,
      onQuickVisibilityChange: onQuickVisibilityChange ?? noop,
      onQuickDelete: onQuickDelete ?? noop,
    }),
    [
      filteredColumns,
      columns,
      resolvedMembers,
      readOnly,
      viewMode,
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
      currentUserId,
      highlightMyTasks,
      activeTask,
      completedColumnId,
      showCompleted,
      onToggleCompleted,
      mobileView,
      mobileBreakpoint,
      isMobileListView,
      onTaskMove,
      onTaskAdd,
      onBulkAction,
      onColumnReorder,
      onColumnRename,
      onColumnDelete,
      onColumnToggleVisibility,
      onColumnWipLimitChange,
      onClickTask,
      onAddColumn,
      onAddTask,
      onQuickPriorityChange,
      onQuickAssign,
      onQuickDueDateChange,
      onQuickLabelAdd,
      onQuickVisibilityChange,
      onQuickDelete,
    ],
  )

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
