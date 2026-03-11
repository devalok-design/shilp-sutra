'use client'

import * as React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/ui/lib/utils'
import { useBoardContext } from './board-context'
import { ColumnHeader } from './column-header'
import { ColumnEmpty } from './column-empty'
import { TaskCard, TaskCardCompact } from './task-card'
import { TaskContextMenu } from './task-context-menu'
import { COLUMN_WIDTH } from './board-constants'
import type { BoardColumn as BoardColumnType, BoardTask } from './board-types'

// ============================================================
// Types
// ============================================================

export interface BoardColumnProps {
  column: BoardColumnType
  index: number
  isOverlay?: boolean
  /** Preview state for a task being dragged into this column */
  dragPreview?: { taskId: string; columnId: string; index: number }
  /** The task currently being dragged (for silhouette rendering) */
  draggedTask?: BoardTask | null
}

// ============================================================
// Ghost silhouette shown at the drop target position
// ============================================================

function TaskGhost() {
  return (
    <div
      className="rounded-ds-lg border-2 border-dashed border-interactive/40 bg-interactive/[0.06] px-ds-04 py-ds-05"
      aria-hidden
    >
      <div className="h-ds-xs-plus w-3/4 rounded-ds-md bg-interactive/10" />
      <div className="mt-ds-02 h-[12px] w-1/2 rounded-ds-md bg-interactive/[0.06]" />
    </div>
  )
}

// ============================================================
// Component
// ============================================================

export const BoardColumn = React.forwardRef<HTMLDivElement, BoardColumnProps>(
  function BoardColumn({ column, index, isOverlay, dragPreview, draggedTask }, ref) {
    const { viewMode } = useBoardContext()

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: `column-${column.id}`,
      data: {
        type: 'column',
        column,
      },
    })

    const taskIds = column.tasks.map((t) => t.id)
    const isWipExceeded =
      column.wipLimit != null && column.tasks.length > column.wipLimit

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full flex-shrink-0 flex-col rounded-ds-xl bg-layer-01/40 backdrop-blur-[2px] border border-border-subtle/20 hover:border-border-subtle/40 transition-colors p-1',
          isOverlay && 'shadow-04',
          isWipExceeded && 'bg-error-surface/50',
        )}
        style={{ width: COLUMN_WIDTH }}
      >
        {/* Column Header */}
        <ColumnHeader column={column} index={index} />

        {/* Task list — droppable area */}
        <div
          ref={setDroppableRef}
          className={cn(
            'no-scrollbar flex flex-1 flex-col gap-ds-02 overflow-y-auto px-ds-03 pt-2.5 pb-ds-03 transition-colors duration-fast-02 ease-productive-standard',
            isOver && 'bg-interactive-subtle/30',
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task, taskIdx) => (
              <React.Fragment key={task.id}>
                {/* Ghost silhouette at this position */}
                {dragPreview && dragPreview.index === taskIdx && (
                  <TaskGhost />
                )}
                <div
                  className="animate-slide-up delay-stagger"
                  style={{ '--stagger-index': taskIdx } as React.CSSProperties}
                >
                  <TaskContextMenu taskId={task.id}>
                    {viewMode === 'compact' ? (
                      <TaskCardCompact task={task} />
                    ) : (
                      <TaskCard task={task} />
                    )}
                  </TaskContextMenu>
                </div>
              </React.Fragment>
            ))}
            {/* Ghost at end of list */}
            {dragPreview && dragPreview.index >= column.tasks.length && (
              <TaskGhost />
            )}
          </SortableContext>

          {/* Empty state */}
          {column.tasks.length === 0 && !dragPreview && (
            <ColumnEmpty
              index={index}
              isDropTarget={isOver}
            />
          )}
          {column.tasks.length === 0 && dragPreview && (
            <TaskGhost />
          )}
        </div>

      </div>
    )
  },
)

BoardColumn.displayName = 'BoardColumn'
