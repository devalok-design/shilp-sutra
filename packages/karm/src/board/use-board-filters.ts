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
