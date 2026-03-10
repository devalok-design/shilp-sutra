import { useCallback, useEffect, type RefObject } from 'react'
import { useBoardContext } from './board-context'

interface TaskPosition {
  columnIndex: number
  taskIndex: number
  taskId: string
}

/**
 * Hook that provides keyboard navigation for the board.
 * Attach to the board container's ref.
 *
 * - Arrow Up/Down: move focus within column
 * - Arrow Left/Right: move focus across columns
 * - Enter: open task (onClickTask)
 * - Space: toggle selection
 * - Shift+Arrow Up/Down: extend selection
 * - Escape: first clears selection, then clears filters
 */
export function useBoardKeyboard(containerRef: RefObject<HTMLElement | null>) {
  const {
    columns,
    focusedTaskId,
    setFocusedTaskId,
    selectedTaskIds,
    toggleTaskSelection,
    selectRange,
    clearSelection,
    clearFilters,
    hasActiveFilters,
    onClickTask,
  } = useBoardContext()

  // Build a 2D grid: columns[colIdx].tasks[taskIdx].id
  const findPosition = useCallback(
    (taskId: string): TaskPosition | null => {
      for (let c = 0; c < columns.length; c++) {
        for (let t = 0; t < columns[c].tasks.length; t++) {
          if (columns[c].tasks[t].id === taskId) {
            return { columnIndex: c, taskIndex: t, taskId }
          }
        }
      }
      return null
    },
    [columns],
  )

  const getTaskAtPosition = useCallback(
    (colIdx: number, taskIdx: number): string | null => {
      const col = columns[colIdx]
      if (!col) return null
      const task = col.tasks[taskIdx]
      return task?.id ?? null
    },
    [columns],
  )

  const scrollTaskIntoView = useCallback((taskId: string) => {
    const el = document.querySelector(`[data-task-id="${taskId}"]`)
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if focus is in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault()
          const direction = e.key === 'ArrowDown' ? 1 : -1

          if (!focusedTaskId) {
            // Focus first task in first non-empty column
            for (const col of columns) {
              if (col.tasks.length > 0) {
                const id = col.tasks[0].id
                setFocusedTaskId(id)
                scrollTaskIntoView(id)
                break
              }
            }
            return
          }

          const pos = findPosition(focusedTaskId)
          if (!pos) return

          const newTaskIdx = pos.taskIndex + direction
          const newId = getTaskAtPosition(pos.columnIndex, newTaskIdx)
          if (newId) {
            setFocusedTaskId(newId)
            scrollTaskIntoView(newId)

            if (e.shiftKey && focusedTaskId) {
              selectRange(focusedTaskId, newId)
            }
          }
          return
        }

        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault()
          const colDirection = e.key === 'ArrowRight' ? 1 : -1

          if (!focusedTaskId) return
          const pos = findPosition(focusedTaskId)
          if (!pos) return

          // Find next non-empty column
          let newColIdx = pos.columnIndex + colDirection
          while (newColIdx >= 0 && newColIdx < columns.length) {
            if (columns[newColIdx].tasks.length > 0) {
              const taskIdx = Math.min(pos.taskIndex, columns[newColIdx].tasks.length - 1)
              const newId = columns[newColIdx].tasks[taskIdx].id
              setFocusedTaskId(newId)
              scrollTaskIntoView(newId)
              return
            }
            newColIdx += colDirection
          }
          return
        }

        case 'Enter': {
          if (focusedTaskId) {
            e.preventDefault()
            onClickTask(focusedTaskId)
          }
          return
        }

        case ' ': {
          if (focusedTaskId) {
            e.preventDefault()
            toggleTaskSelection(focusedTaskId)
          }
          return
        }

        case 'Escape': {
          e.preventDefault()
          if (selectedTaskIds.size > 0) {
            clearSelection()
          } else if (hasActiveFilters) {
            clearFilters()
          }
          return
        }
      }
    },
    [
      focusedTaskId,
      columns,
      selectedTaskIds,
      hasActiveFilters,
      findPosition,
      getTaskAtPosition,
      setFocusedTaskId,
      scrollTaskIntoView,
      toggleTaskSelection,
      selectRange,
      clearSelection,
      clearFilters,
      onClickTask,
    ],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, handleKeyDown])
}
