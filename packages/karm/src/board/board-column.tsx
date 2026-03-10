'use client'

import * as React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/ui/lib/utils'
import { IconPlus } from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import { ColumnHeader } from './column-header'
import { ColumnEmpty } from './column-empty'
import { TaskCard, TaskCardCompact } from './task-card'
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
    const { viewMode, onTaskAdd } = useBoardContext()

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

    const [isAdding, setIsAdding] = React.useState(false)

    const openAddTask = () => {
      setIsAdding(true)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full flex-shrink-0 flex-col rounded-ds-xl bg-field/50 backdrop-blur-[2px]',
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
            'no-scrollbar flex flex-1 flex-col gap-ds-02 overflow-y-auto px-ds-03 pb-ds-03 transition-colors duration-fast-02 ease-productive-standard',
            isOver && 'bg-interactive-subtle/30',
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) =>
              viewMode === 'compact' ? (
                <TaskCardCompact key={task.id} task={task} />
              ) : (
                <TaskCard key={task.id} task={task} />
              ),
            )}
          </SortableContext>

          {/* Empty state */}
          {column.tasks.length === 0 && !isAdding && (
            <ColumnEmpty
              index={index}
              onAddTask={openAddTask}
              isDropTarget={isOver}
            />
          )}
        </div>

        {/* Bottom add task bar */}
        <button
          onClick={openAddTask}
          className="flex items-center gap-ds-02b border-t border-border-subtle px-ds-04 py-ds-03 text-ds-sm text-text-placeholder transition-colors hover:bg-field hover:text-text-tertiary"
        >
          <IconPlus className="h-3 w-3" />
          Add task
        </button>
      </div>
    )
  },
)

BoardColumn.displayName = 'BoardColumn'
