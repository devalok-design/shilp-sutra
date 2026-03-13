'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/ui/lib/utils'
import { springs } from '@/ui/lib/motion'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'
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

export interface BoardColumnProps extends React.HTMLAttributes<HTMLDivElement> {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springs.snappy}
      className="rounded-ds-lg border-2 border-dashed border-accent-6 bg-accent-1 px-ds-04 py-ds-05"
      aria-hidden
    >
      <div className="h-ds-xs-plus w-3/4 rounded-ds-md bg-accent-2" />
      <div className="mt-ds-02 h-[12px] w-1/2 rounded-ds-md bg-accent-1" />
    </motion.div>
  )
}

// ============================================================
// Component
// ============================================================

export const BoardColumn = React.forwardRef<HTMLDivElement, BoardColumnProps>(
  function BoardColumn({ column, index, isOverlay, dragPreview, draggedTask, className, ...props }, ref) {
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
          'flex h-full flex-shrink-0 flex-col rounded-ds-xl bg-surface-2 border border-surface-3 hover:border-surface-border transition-colors p-1',
          isOverlay && 'shadow-04',
          isWipExceeded && 'bg-error-3',
          className,
        )}
        {...props}
        style={{ ...props.style, width: COLUMN_WIDTH }}
      >
        {/* Column Header */}
        <ColumnHeader column={column} index={index} />

        {/* Task list — droppable area */}
        <motion.div
          ref={setDroppableRef}
          animate={{
            backgroundColor: isOver ? 'var(--color-accent-1, rgba(59,130,246,0.06))' : 'transparent',
          }}
          transition={springs.snappy}
          className="no-scrollbar flex flex-1 flex-col gap-ds-02 overflow-y-auto px-ds-03 pt-2.5 pb-ds-03"
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <MotionStagger className="contents">
              {column.tasks.map((task, taskIdx) => (
                <React.Fragment key={task.id}>
                  {/* Ghost silhouette at this position */}
                  <AnimatePresence>
                    {dragPreview && dragPreview.index === taskIdx && (
                      <TaskGhost />
                    )}
                  </AnimatePresence>
                  <MotionStaggerItem>
                    <TaskContextMenu taskId={task.id}>
                      {viewMode === 'compact' ? (
                        <TaskCardCompact task={task} />
                      ) : (
                        <TaskCard task={task} />
                      )}
                    </TaskContextMenu>
                  </MotionStaggerItem>
                </React.Fragment>
              ))}
            </MotionStagger>
            {/* Ghost at end of list */}
            <AnimatePresence>
              {dragPreview && dragPreview.index >= column.tasks.length && (
                <TaskGhost />
              )}
            </AnimatePresence>
          </SortableContext>

          {/* Empty state */}
          {column.tasks.length === 0 && !dragPreview && (
            <ColumnEmpty
              index={index}
              isDropTarget={isOver}
            />
          )}
          <AnimatePresence>
            {column.tasks.length === 0 && dragPreview && (
              <TaskGhost />
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    )
  },
)

BoardColumn.displayName = 'BoardColumn'
