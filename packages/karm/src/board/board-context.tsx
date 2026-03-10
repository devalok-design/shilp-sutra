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
  BoardTask,
  BoardViewMode,
  BulkAction,
} from './board-types'
import { DEFAULT_FILTERS } from './board-constants'
import { useFilteredColumns } from './use-board-filters'

interface BoardContextValue {
  columns: BoardColumn[]
  rawColumns: BoardColumn[]
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
  onTaskAdd: (columnId: string, title: string) => void
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

export function BoardProvider({
  initialData,
  currentUserId = null,
  children,
  ...callbacks
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

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  const [highlightMyTasks, setHighlightMyTasks] = useState(false)
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
      filteredColumns,
      columns,
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
      callbacks,
    ],
  )

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
