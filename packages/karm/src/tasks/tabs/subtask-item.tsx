'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import {
  IconSquareCheck,
  IconSquare,
} from '@tabler/icons-react'
import { getInitials } from '@/composed/lib/string-utils'
import { PRIORITY_DOT_COLORS } from '../task-constants'
import type { Subtask } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface SubtaskItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  subtask: Subtask
  isComplete: boolean
  onToggle?: (id: string, isComplete: boolean) => void
  onClick?: (id: string) => void
}

// ============================================================
// SubtaskItem
// ============================================================

const SubtaskItem = React.forwardRef<HTMLDivElement, SubtaskItemProps>(
  function SubtaskItem({ subtask, isComplete, onToggle, onClick, className, ...props }, ref) {
    const firstAssignee = subtask.assignees[0]?.user

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          'group flex items-center gap-ds-03 rounded-ds-lg px-ds-03 py-ds-02b transition-colors',
          'hover:bg-surface-3 cursor-pointer',
          className,
        )}
        onClick={() => onClick?.(subtask.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.(subtask.id)
          }
        }}
        {...props}
      >
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle?.(subtask.id, !isComplete)
          }}
          className={cn(
            'shrink-0 rounded p-ds-01 transition-colors',
            onToggle ? 'hover:bg-surface-2' : 'cursor-default',
          )}
        >
          {isComplete ? (
            <IconSquareCheck className="h-ico-sm w-ico-sm text-accent-11" stroke={1.5} />
          ) : (
            <IconSquare className="h-ico-sm w-ico-sm text-surface-fg-subtle" stroke={1.5} />
          )}
        </button>

        {/* Priority dot */}
        <div
          className={cn(
            'h-2 w-2 shrink-0 rounded-ds-full',
            PRIORITY_DOT_COLORS[subtask.priority],
          )}
        />

        {/* Title */}
        <span
          className={cn(
            'flex-1 truncate text-ds-md',
            isComplete
              ? 'text-surface-fg-subtle line-through'
              : 'text-surface-fg',
          )}
        >
          {subtask.title}
        </span>

        {/* Assignee */}
        {firstAssignee && (
          <Avatar className="h-ico-md w-ico-md shrink-0">
            {firstAssignee.image && (
              <AvatarImage src={firstAssignee.image} alt={firstAssignee.name} />
            )}
            <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
              {getInitials(firstAssignee.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  },
)

SubtaskItem.displayName = 'SubtaskItem'

export { SubtaskItem }
