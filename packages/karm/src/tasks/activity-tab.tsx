'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import {
  IconActivity,
  IconArrowRight,
  IconMessage,
  IconPaperclip,
  IconUserPlus,
  IconUserMinus,
  IconFlag,
  IconEye,
  IconTag,
  IconCalendarEvent,
  IconPlus,
  IconGitPullRequest,
  IconCircleCheck,
  IconEdit,
} from '@tabler/icons-react'
import type { Icon as TablerIcon } from '@tabler/icons-react'
import { formatTimestamp } from './task-utils'

// ============================================================
// Types
// ============================================================

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorType: 'USER' | 'CLIENT' | 'SYSTEM' | 'AGENT'
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  projectId: string | null
  metadata: Record<string, unknown> | null
}

interface ActivityTabProps extends React.HTMLAttributes<HTMLDivElement> {
  activities: AuditLogEntry[]
}

// ============================================================
// Action Config
// ============================================================

interface ActionConfig {
  icon: TablerIcon
  color: string
  dotColor: string
  getDescription: (entry: AuditLogEntry) => string
}

const ACTION_MAP: Record<string, ActionConfig> = {
  'task.created': {
    icon: IconPlus,
    color: 'text-success-11',
    dotColor: 'bg-success-9',
    getDescription: () => 'created this task',
  },
  'task.updated': {
    icon: IconEdit,
    color: 'text-category-slate-11',
    dotColor: 'bg-category-slate-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      if (meta?.field === 'title') return 'updated the title'
      if (meta?.field === 'description') return 'updated the description'
      if (meta?.field === 'priority')
        return `changed priority to ${meta?.newValue || 'unknown'}`
      if (meta?.field === 'dueDate') return 'updated the due date'
      if (meta?.field === 'labels') return 'updated labels'
      return 'updated this task'
    },
  },
  'task.moved': {
    icon: IconArrowRight,
    color: 'text-warning-11',
    dotColor: 'bg-warning-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      const from = meta?.fromColumn || 'unknown'
      const to = meta?.toColumn || 'unknown'
      return `moved from ${from} to ${to}`
    },
  },
  'task.assigned': {
    icon: IconUserPlus,
    color: 'text-category-cyan-11',
    dotColor: 'bg-category-cyan-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `assigned ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.unassigned': {
    icon: IconUserMinus,
    color: 'text-surface-fg-muted',
    dotColor: 'bg-disabled',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `removed ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.commented': {
    icon: IconMessage,
    color: 'text-accent-11',
    dotColor: 'bg-accent-9',
    getDescription: () => 'added a comment',
  },
  'task.file_uploaded': {
    icon: IconPaperclip,
    color: 'text-category-indigo-11',
    dotColor: 'bg-category-indigo-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `uploaded ${meta?.fileName || 'a file'}`
    },
  },
  'task.review_requested': {
    icon: IconGitPullRequest,
    color: 'text-warning-11',
    dotColor: 'bg-warning-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `requested review from ${meta?.reviewerName || 'a reviewer'}`
    },
  },
  'task.review_completed': {
    icon: IconCircleCheck,
    color: 'text-success-11',
    dotColor: 'bg-success-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `${meta?.status || 'reviewed'} the task`
    },
  },
  'task.visibility_changed': {
    icon: IconEye,
    color: 'text-surface-fg-subtle',
    dotColor: 'bg-surface-fg-subtle',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `changed visibility to ${meta?.visibility || 'unknown'}`
    },
  },
  'task.priority_changed': {
    icon: IconFlag,
    color: 'text-error-11',
    dotColor: 'bg-error-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `changed priority to ${meta?.priority || 'unknown'}`
    },
  },
  'task.labels_changed': {
    icon: IconTag,
    color: 'text-category-amber-11',
    dotColor: 'bg-category-amber-9',
    getDescription: () => 'updated labels',
  },
  'task.due_date_changed': {
    icon: IconCalendarEvent,
    color: 'text-warning-11',
    dotColor: 'bg-warning-9',
    getDescription: (entry) => {
      const meta = entry.metadata
      if (meta?.dueDate) return `set due date to ${meta.dueDate}`
      return 'updated the due date'
    },
  },
}

const DEFAULT_ACTION: ActionConfig = {
  icon: IconActivity,
  color: 'text-surface-fg-subtle',
  dotColor: 'bg-disabled',
  getDescription: (entry) => entry.action,
}

// ============================================================
// Helpers
// ============================================================

function getActorName(entry: AuditLogEntry): string {
  const meta = entry.metadata
  if (meta?.actorName) return meta.actorName as string
  if (entry.actorType === 'SYSTEM') return 'System'
  if (entry.actorType === 'AGENT') return 'AI Agent'
  return 'Someone'
}

// ============================================================
// IconActivity Tab
// ============================================================

const ActivityTab = React.forwardRef<HTMLDivElement, ActivityTabProps>(
  function ActivityTab({ activities, className, ...props }, ref) {
  if (activities.length === 0) {
    return (
      <EmptyState
        ref={ref}
        icon={<IconActivity />}
        title="No activity yet"
        description="Actions on this task will appear here"
        compact
        className={className}
        {...props}
      />
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-surface-border" />

      {/* Entries */}
      <div className="space-y-ds-05">
        {activities.map((entry) => {
          const config = ACTION_MAP[entry.action] || DEFAULT_ACTION
          const Icon = config.icon
          const actorName = getActorName(entry)
          const description = config.getDescription(entry)

          return (
            <div key={entry.id} className="relative flex gap-ds-04 pl-0">
              {/* Dot on timeline */}
              <div className="relative z-raised flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-ds-full bg-surface-1">
                <div
                  className={cn(
                    'flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-surface-2',
                  )}
                >
                  <Icon
                    className={cn('h-3 w-3', config.color)}
                    stroke={2}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-ds-01">
                <p className="text-ds-sm">
                  <span className="font-medium text-surface-fg">
                    {actorName}
                  </span>
                  <span className="text-surface-fg-subtle">
                    {' '}{description}
                  </span>
                </p>
                <p className="mt-ds-01 text-ds-xs text-surface-fg-subtle">
                  {formatTimestamp(entry.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
},
)

ActivityTab.displayName = 'ActivityTab'

export { ActivityTab }
export type { ActivityTabProps }
