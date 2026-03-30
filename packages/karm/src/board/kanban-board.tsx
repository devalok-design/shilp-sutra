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
import { cn } from '@/ui/lib/utils'
import { BoardProvider, useBoardContext, type BoardProviderProps } from './board-context'
import { BoardToolbar } from './board-toolbar'
import { BulkActionBar } from './bulk-action-bar'
import { BoardColumn, ReadOnlyBoardColumn } from './board-column'
import { TaskCardOverlay, TaskCardCompactOverlay } from './task-card'
import { useBoardKeyboard } from './use-board-keyboard'
import { COLUMN_WIDTH } from './board-constants'
import type { BoardTask, BoardColumn as BoardColumnType, NewTaskOptions } from './board-types'
import { IconPlus } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'
import { COLUMN_ACCENT_COLORS } from './board-constants'

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
// Mobile list view — flat grouped list (K11)
// ============================================================

function BoardListView() {
  const {
    columns,
    viewMode,
    completedColumnId,
    showCompleted,
    onClickTask,
  } = useBoardContext()

  return (
    <div className="flex flex-col gap-ds-03 pb-ds-05">
      {columns.map((column, colIdx) => {
        const isCompletedColumn = completedColumnId != null && column.id === completedColumnId
        const hideCompletedTasks = isCompletedColumn && !showCompleted
        const accentColor = COLUMN_ACCENT_COLORS[colIdx % COLUMN_ACCENT_COLORS.length]

        return (
          <div key={column.id} className="flex flex-col">
            {/* Sticky group header */}
            <div className="sticky top-0 z-10 flex items-center gap-ds-02 bg-surface-base px-ds-04 py-ds-03 border-b border-surface-border-subtle">
              <span
                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${accentColor}`}
                aria-hidden="true"
              />
              <span className="text-ds-sm font-semibold text-surface-fg">
                {column.name}
              </span>
              <Badge variant="subtle" className="ml-auto text-ds-xs">
                {column.tasks.length}
              </Badge>
            </div>

            {/* Tasks */}
            {hideCompletedTasks ? (
              <div className="px-ds-04 py-ds-03 text-ds-xs text-surface-fg-subtle">
                {column.tasks.length} completed {column.tasks.length === 1 ? 'task' : 'tasks'}
              </div>
            ) : column.tasks.length === 0 ? (
              <div className="px-ds-04 py-ds-03 text-ds-xs text-surface-fg-subtle">
                No tasks
              </div>
            ) : (
              <div className="flex flex-col">
                {column.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onClickTask(task.id)}
                    className="flex items-center gap-ds-03 border-b border-surface-border-subtle px-ds-04 py-ds-03 text-left transition-colors hover:bg-surface-raised-hover"
                  >
                    <span className="flex-1 truncate text-ds-sm text-surface-fg">
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className="flex-shrink-0 text-ds-xs text-surface-fg-subtle">
                        {task.priority}
                      </span>
                    )}
                    {task.owner && (
                      <span className="flex-shrink-0 text-ds-xs text-surface-fg-subtle">
                        {task.owner.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
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
        className="flex h-full gap-ds-05 overflow-x-auto pb-ds-02 outline-none [scrollbar-width:thin] [scrollbar-color:var(--color-surface-border)_transparent]"
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

        {/* Add column button — only shown when callback is provided */}
        {onAddColumn && <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onAddColumn}
            className="h-ds-md w-[320px] justify-start gap-ds-03 rounded-ds-xl border border-dashed border-surface-border bg-surface-raised text-surface-fg-subtle hover:border-accent-7 hover:bg-accent-2 hover:text-accent-11"
          >
            <Icon icon={IconPlus} size="sm" />
            Add column
          </Button>
        </div>}
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
// Read-only canvas (no DnD, no toolbar, no selection)
// ============================================================

function ReadOnlyCanvas({ className }: { className?: string }) {
  const { columns } = useBoardContext()

  return (
    <div className={cn('flex h-full gap-ds-05 overflow-x-auto pb-ds-02 [scrollbar-width:thin] [scrollbar-color:var(--color-surface-border)_transparent]', className)}>
      <MotionStagger delay={0.05} className="contents">
        {columns.map((column, index) => (
          <MotionStaggerItem key={column.id} className="flex-shrink-0">
            <ReadOnlyBoardColumn column={column} index={index} />
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </div>
  )
}

// ============================================================
// KanbanBoard — public orchestrator
// ============================================================

function BoardContent() {
  const { readOnly, isMobileListView } = useBoardContext()

  if (readOnly) {
    return isMobileListView ? <BoardListView /> : <ReadOnlyCanvas />
  }

  return (
    <div className="flex h-full flex-col gap-ds-03">
      <BoardToolbar />
      <BulkActionBar />
      <div className="min-h-0 flex-1">
        {isMobileListView ? <BoardListView /> : <BoardCanvas />}
      </div>
    </div>
  )
}

export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  function KanbanBoard({ className, ...providerProps }, ref) {
    return (
      <div ref={ref} className={className}>
        <BoardProvider {...providerProps}>
          <BoardContent />
        </BoardProvider>
      </div>
    )
  },
)

KanbanBoard.displayName = 'KanbanBoard'
