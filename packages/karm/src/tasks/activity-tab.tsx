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

interface ActivityTabProps {
  activities: AuditLogEntry[]
  className?: string
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
    color: 'text-success-text',
    dotColor: 'bg-success',
    getDescription: () => 'created this task',
  },
  'task.updated': {
    icon: IconEdit,
    color: 'text-category-slate-text',
    dotColor: 'bg-category-slate',
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
    color: 'text-warning-text',
    dotColor: 'bg-warning',
    getDescription: (entry) => {
      const meta = entry.metadata
      const from = meta?.fromColumn || 'unknown'
      const to = meta?.toColumn || 'unknown'
      return `moved from ${from} to ${to}`
    },
  },
  'task.assigned': {
    icon: IconUserPlus,
    color: 'text-category-cyan-text',
    dotColor: 'bg-category-cyan',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `assigned ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.unassigned': {
    icon: IconUserMinus,
    color: 'text-text-secondary',
    dotColor: 'bg-icon-disabled',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `removed ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.commented': {
    icon: IconMessage,
    color: 'text-interactive',
    dotColor: 'bg-interactive',
    getDescription: () => 'added a comment',
  },
  'task.file_uploaded': {
    icon: IconPaperclip,
    color: 'text-category-indigo-text',
    dotColor: 'bg-category-indigo',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `uploaded ${meta?.fileName || 'a file'}`
    },
  },
  'task.review_requested': {
    icon: IconGitPullRequest,
    color: 'text-warning-text',
    dotColor: 'bg-warning',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `requested review from ${meta?.reviewerName || 'a reviewer'}`
    },
  },
  'task.review_completed': {
    icon: IconCircleCheck,
    color: 'text-success-text',
    dotColor: 'bg-success',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `${meta?.status || 'reviewed'} the task`
    },
  },
  'task.visibility_changed': {
    icon: IconEye,
    color: 'text-text-tertiary',
    dotColor: 'bg-icon-secondary',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `changed visibility to ${meta?.visibility || 'unknown'}`
    },
  },
  'task.priority_changed': {
    icon: IconFlag,
    color: 'text-error-text',
    dotColor: 'bg-error',
    getDescription: (entry) => {
      const meta = entry.metadata
      return `changed priority to ${meta?.priority || 'unknown'}`
    },
  },
  'task.labels_changed': {
    icon: IconTag,
    color: 'text-category-amber-text',
    dotColor: 'bg-category-amber',
    getDescription: () => 'updated labels',
  },
  'task.due_date_changed': {
    icon: IconCalendarEvent,
    color: 'text-warning-text',
    dotColor: 'bg-warning',
    getDescription: (entry) => {
      const meta = entry.metadata
      if (meta?.dueDate) return `set due date to ${meta.dueDate}`
      return 'updated the due date'
    },
  },
}

const DEFAULT_ACTION: ActionConfig = {
  icon: IconActivity,
  color: 'text-text-placeholder',
  dotColor: 'bg-icon-disabled',
  getDescription: (entry) => entry.action,
}

// ============================================================
// Helpers
// ============================================================

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

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
  function ActivityTab({ activities, className }, ref) {
  if (activities.length === 0) {
    return (
      <EmptyState
        ref={ref}
        icon={<IconActivity />}
        title="No activity yet"
        description="Actions on this task will appear here"
        compact
        className={className}
      />
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

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
              <div className="relative z-raised flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-ds-full bg-layer-01">
                <div
                  className={cn(
                    'flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-layer-02',
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
                  <span className="font-medium text-text-primary">
                    {actorName}
                  </span>
                  <span className="text-text-tertiary">
                    {' '}{description}
                  </span>
                </p>
                <p className="mt-ds-01 text-ds-xs text-text-placeholder">
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
