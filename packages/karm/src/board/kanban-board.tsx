'use client'

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useComposedRef } from '../utils/use-composed-ref'
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
import { BoardProvider, useBoardContext, type BoardProviderProps } from './board-context'
import { BoardToolbar } from './board-toolbar'
import { BulkActionBar } from './bulk-action-bar'
import { BoardColumn } from './board-column'
import { TaskCardOverlay, TaskCardCompactOverlay } from './task-card'
import { useBoardKeyboard } from './use-board-keyboard'
import { COLUMN_WIDTH } from './board-constants'
import type { BoardTask, BoardColumn as BoardColumnType, NewTaskOptions } from './board-types'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/ui/button'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'

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

export interface KanbanBoardProps extends Omit<BoardProviderProps, 'children'> {
  /** Additional className for the outer wrapper */
  className?: string
}

// ============================================================
// Inner canvas (needs BoardContext)
// ============================================================

function BoardCanvas({ className }: { className?: string }) {
  const {
    columns,
    viewMode,
    activeTask,
    setActiveTask,
    onTaskMove,
    onAddColumn,
  } = useBoardContext()

  const [mounted, setMounted] = useState(false)
  const [dragPreview, setDragPreview] = useState<{
    taskId: string
    columnId: string
    index: number
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  // Keyboard navigation
  useBoardKeyboard(canvasRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const announcements = useMemo(() => createAnnouncements(), [])

  const columnIds = columns.map((c) => `column-${c.id}`)

  // Find which column a task lives in
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

  // DnD handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current
      if (data?.type === 'task') {
        setActiveTask(data.task as BoardTask)
      }
    },
    [setActiveTask],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) {
        setDragPreview(null)
        return
      }

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumnId = findColumnByTaskId(activeId)
      if (!activeColumnId) return

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

      if (!overColumnId) {
        setDragPreview(null)
        return
      }

      // Same column — no preview needed
      if (activeColumnId === overColumnId) {
        setDragPreview(null)
        return
      }

      // Show silhouette in target column instead of moving the task
      setDragPreview({ taskId: activeId, columnId: overColumnId, index: overIndex })
    },
    [columns, findColumnByTaskId],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const preview = dragPreview
      setActiveTask(null)
      setDragPreview(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumnId = findColumnByTaskId(activeId)
      if (!activeColumnId) return

      // If we had a cross-column preview, use it for the move
      if (preview && preview.taskId === activeId) {
        onTaskMove(activeId, preview.columnId, preview.index)
        return
      }

      // Same-column reorder or drop on column header
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

      onTaskMove(activeId, targetColumnId, newOrder)
    },
    [columns, dragPreview, findColumnByTaskId, setActiveTask, onTaskMove],
  )

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setDragPreview(null)
  }, [setActiveTask])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{ announcements }}
    >
      <div
        ref={canvasRef}
        tabIndex={0}
        className="no-scrollbar flex h-full gap-ds-05 overflow-x-auto pb-ds-05 outline-none"
      >
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          <MotionStagger delay={0.05} className="contents">
            {columns.map((column, index) => (
              <MotionStaggerItem
                key={column.id}
                className="flex-shrink-0"
              >
                <BoardColumn
                  column={column}
                  index={index}
                  dragPreview={dragPreview?.columnId === column.id ? dragPreview : undefined}
                  draggedTask={activeTask}
                />
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </SortableContext>

        {/* Add column button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onAddColumn}
            className="h-ds-md w-[320px] justify-start gap-ds-03 rounded-ds-xl border border-dashed border-border/60 bg-layer-02 text-text-tertiary hover:border-border-interactive hover:bg-interactive-subtle/50 hover:text-interactive"
          >
            <IconPlus className="h-ico-sm w-ico-sm" />
            Add column
          </Button>
        </div>
      </div>

      {/* Drag overlay — rendered in portal */}
      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={{ duration: 240, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {activeTask ? (
              viewMode === 'compact' ? (
                <TaskCardCompactOverlay task={activeTask} />
              ) : (
                <TaskCardOverlay task={activeTask} />
              )
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  )
}

// ============================================================
// KanbanBoard — public orchestrator
// ============================================================

export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  function KanbanBoard({ className, ...providerProps }, ref) {
    return (
      <div ref={ref} className={className}>
        <BoardProvider {...providerProps}>
          <div className="flex flex-col gap-ds-03">
            <BoardToolbar />
            <BulkActionBar />
            <BoardCanvas />
          </div>
        </BoardProvider>
      </div>
    )
  },
)

KanbanBoard.displayName = 'KanbanBoard'
