'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { BoardColumn, type BoardColumnData } from './board-column'
import { TaskCardOverlay, type BoardTask } from './task-card'
import { Plus } from 'lucide-react'
import { Button } from '../../ui/button'

// ============================================================
// Accessibility announcements
// ============================================================

function createAnnouncements() {
  return {
    onDragStart({ active }: DragStartEvent) {
      const data = active.data.current
      if (data?.type === 'task') {
        return `Picked up task: ${data.task.title}`
      }
      return 'Picked up item'
    },
    onDragOver({ active, over }: DragOverEvent) {
      if (!over) return
      const activeData = active.data.current
      if (activeData?.type === 'task') {
        return `Task ${activeData.task.title} is over ${over.id}`
      }
      return undefined
    },
    onDragEnd({ active, over }: DragEndEvent) {
      if (!over) return 'Dropped item'
      const activeData = active.data.current
      if (activeData?.type === 'task') {
        return `Dropped task: ${activeData.task.title}`
      }
      return 'Dropped item'
    },
    onDragCancel() {
      return 'Dragging cancelled'
    },
  }
}

// ============================================================
// Types
// ============================================================

export interface BoardData {
  columns: BoardColumnData[]
}

interface KanbanBoardProps {
  initialData: BoardData
  onTaskMove?: (taskId: string, toColumnId: string, newOrder: number) => void
  onTaskAdd?: (columnId: string, title: string) => void
  onColumnRename?: (columnId: string, name: string) => void
  onColumnDelete?: (columnId: string) => void
  onColumnToggleVisibility?: (columnId: string, visible: boolean) => void
  onClickTask?: (taskId: string) => void
  onAddColumn?: () => void
}

// ============================================================
// Component
// ============================================================

export function KanbanBoard({
  initialData,
  onTaskMove,
  onTaskAdd,
  onColumnRename,
  onColumnDelete,
  onColumnToggleVisibility,
  onClickTask,
  onAddColumn,
}: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardData>(initialData)
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync board when initialData changes
  useEffect(() => {
    setBoard(initialData)
  }, [initialData])

  // Track mount for portal rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const announcements = useMemo(() => createAnnouncements(), [])

  const columns = board.columns
  const columnIds = columns.map((c) => `column-${c.id}`)

  // --------------------------------------------------------
  // Find which column a task lives in
  // --------------------------------------------------------
  const findColumnByTaskId = useCallback(
    (taskId: UniqueIdentifier): string | null => {
      for (const col of columns) {
        if (col.tasks.some((t) => t.id === taskId)) {
          return col.id
        }
      }
      return null
    },
    [columns],
  )

  // --------------------------------------------------------
  // Local state helpers
  // --------------------------------------------------------
  const moveTaskInState = useCallback(
    (
      taskId: string,
      fromColumnId: string,
      toColumnId: string,
      toIndex: number,
    ) => {
      setBoard((prev) => {
        const newColumns = prev.columns.map((col) => ({
          ...col,
          tasks: [...col.tasks],
        }))

        const fromCol = newColumns.find((c) => c.id === fromColumnId)
        const toCol = newColumns.find((c) => c.id === toColumnId)
        if (!fromCol || !toCol) return prev

        const taskIndex = fromCol.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) return prev

        const [task] = fromCol.tasks.splice(taskIndex, 1)
        toCol.tasks.splice(toIndex, 0, task)

        return { columns: newColumns }
      })
    },
    [],
  )

  // --------------------------------------------------------
  // Drag handlers
  // --------------------------------------------------------
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.type === 'task') {
      setActiveTask(data.task as BoardTask)
    }
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Determine source column
      const activeColumnId = findColumnByTaskId(activeId)
      if (!activeColumnId) return

      // Determine target column
      let overColumnId: string | null = null
      let overIndex = 0

      if (overId.startsWith('column-')) {
        overColumnId = overId.replace('column-', '')
        const overCol = columns.find((c) => c.id === overColumnId)
        overIndex = overCol?.tasks.length ?? 0
      } else {
        overColumnId = findColumnByTaskId(overId)
        if (overColumnId) {
          const overCol = columns.find((c) => c.id === overColumnId)
          overIndex = overCol?.tasks.findIndex((t) => t.id === overId) ?? 0
        }
      }

      if (!overColumnId || activeColumnId === overColumnId) return

      // Only move between columns during dragOver
      moveTaskInState(activeId, activeColumnId, overColumnId, overIndex)
    },
    [columns, findColumnByTaskId, moveTaskInState],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumnId = findColumnByTaskId(activeId)
      if (!activeColumnId) return

      let targetColumnId: string
      let newOrder: number

      if (overId.startsWith('column-')) {
        targetColumnId = overId.replace('column-', '')
        const col = columns.find((c) => c.id === targetColumnId)
        newOrder = col?.tasks.length ?? 0
        if (activeColumnId === targetColumnId) {
          const currentIndex = col?.tasks.findIndex((t) => t.id === activeId)
          if (currentIndex !== undefined && currentIndex >= 0) {
            newOrder = currentIndex
          }
        }
      } else {
        targetColumnId = findColumnByTaskId(overId) ?? activeColumnId
        const col = columns.find((c) => c.id === targetColumnId)
        newOrder = col?.tasks.findIndex((t) => t.id === overId) ?? 0
      }

      // Reorder within same column
      if (activeColumnId === targetColumnId) {
        const col = columns.find((c) => c.id === targetColumnId)
        const oldIndex = col?.tasks.findIndex((t) => t.id === activeId)
        if (oldIndex !== undefined && oldIndex !== newOrder) {
          moveTaskInState(activeId, activeColumnId, targetColumnId, newOrder)
        }
      }

      // Notify parent
      onTaskMove?.(activeId, targetColumnId, newOrder)
    },
    [columns, findColumnByTaskId, moveTaskInState, onTaskMove],
  )

  const handleAddTask = (columnId: string, title: string) => {
    onTaskAdd?.(columnId, title)
  }

  const handleRenameColumn = (columnId: string, name: string) => {
    setBoard((prev) => ({
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, name } : c,
      ),
    }))
    onColumnRename?.(columnId, name)
  }

  const handleDeleteColumn = (columnId: string) => {
    setBoard((prev) => ({
      columns: prev.columns.filter((c) => c.id !== columnId),
    }))
    onColumnDelete?.(columnId)
  }

  const handleToggleVisibility = (columnId: string, visible: boolean) => {
    setBoard((prev) => ({
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, isClientVisible: visible } : c,
      ),
    }))
    onColumnToggleVisibility?.(columnId, visible)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements }}
    >
      <div
        ref={scrollRef}
        className="no-scrollbar flex h-full gap-4 overflow-x-auto pb-4"
      >
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column, index) => (
            <div key={column.id} className="group flex-shrink-0">
              <BoardColumn
                column={column}
                index={index}
                onAddTask={handleAddTask}
                onClickTask={onClickTask}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>
          ))}
        </SortableContext>

        {/* Add column button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onAddColumn}
            className="h-10 w-[300px] justify-start gap-2 rounded-[var(--radius-xl)] border border-dashed border-border/60 bg-white/40 text-muted-foreground hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-600"
          >
            <Plus className="h-4 w-4" />
            Add column
          </Button>
        </div>
      </div>

      {/* Drag overlay -- rendered in portal for smooth visuals */}
      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={null}>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  )
}
