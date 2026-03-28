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
import { Icon } from '@/ui/icon'
import { getInitials } from '@/composed/lib/string-utils'
import { PRIORITY_DOT_COLORS } from '../task-constants'
import type { Subtask } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface SubtaskItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'onToggle'> {
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
          'hover:bg-surface-raised-hover cursor-pointer',
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
            onToggle ? 'hover:bg-surface-raised-hover' : 'cursor-default',
          )}
        >
          {isComplete ? (
            <Icon icon={IconSquareCheck} size="sm" stroke="light" className="text-accent-11" />
          ) : (
            <Icon icon={IconSquare} size="sm" stroke="light" className="text-surface-fg-subtle" />
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
            <AvatarFallback className="bg-surface-raised-hover text-ds-xs font-semibold text-surface-fg">
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
