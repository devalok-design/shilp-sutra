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
import type { BoardColumn as BoardColumnType } from './board-types'

// ============================================================
// Types
// ============================================================

export interface BoardColumnProps {
  column: BoardColumnType
  index: number
  isOverlay?: boolean
}

// ============================================================
// Component
// ============================================================

export const BoardColumn = React.forwardRef<HTMLDivElement, BoardColumnProps>(
  function BoardColumn({ column, index, isOverlay }, ref) {
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
              <div
                key={task.id}
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
            ))}
          </SortableContext>

          {/* Empty state */}
          {column.tasks.length === 0 && (
            <ColumnEmpty
              index={index}
              isDropTarget={isOver}
            />
          )}
        </div>

      </div>
    )
  },
)

BoardColumn.displayName = 'BoardColumn'
