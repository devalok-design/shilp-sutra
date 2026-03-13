'use client'

// packages/karm/src/board/board-context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  /** Explicit member list for assignment dropdowns. Falls back to deriving from task assignees. */
  members?: BoardMember[]
  children: ReactNode
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

  const [viewMode, setViewMode] = useState<BoardViewMode>('default')

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

  const value = useMemo<BoardContextValue>(
    () => ({
      columns: filteredColumns,
      rawColumns: columns,
      members: resolvedMembers,
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
      onTaskMove: onTaskMove ?? noop,
      onTaskAdd: onTaskAdd ?? noop,
      onBulkAction: onBulkAction ?? noop,
      onColumnReorder: onColumnReorder ?? noop,
      onColumnRename: onColumnRename ?? noop,
      onColumnDelete: onColumnDelete ?? noop,
      onColumnToggleVisibility: onColumnToggleVisibility ?? noop,
      onColumnWipLimitChange: onColumnWipLimitChange ?? noop,
      onClickTask: onClickTask ?? noop,
      onAddColumn: onAddColumn ?? noop,
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
