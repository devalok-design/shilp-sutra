'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { EmptyState } from '../../shared/empty-state'
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
    color: 'text-[var(--color-success-text)]',
    dotColor: 'bg-[var(--color-success)]',
    getDescription: () => 'created this task',
  },
  'task.updated': {
    icon: IconEdit,
    color: 'text-[var(--color-info-text)]',
    dotColor: 'bg-[var(--color-info)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
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
    color: 'text-[var(--color-warning-text)]',
    dotColor: 'bg-[var(--color-warning)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      const from = meta?.fromColumn || 'unknown'
      const to = meta?.toColumn || 'unknown'
      return `moved from ${from} to ${to}`
    },
  },
  'task.assigned': {
    icon: IconUserPlus,
    color: 'text-[var(--color-info-text)]',
    dotColor: 'bg-[var(--color-info)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `assigned ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.unassigned': {
    icon: IconUserMinus,
    color: 'text-[var(--color-text-secondary)]',
    dotColor: 'bg-[var(--color-icon-disabled)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `removed ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.commented': {
    icon: IconMessage,
    color: 'text-[var(--color-interactive)]',
    dotColor: 'bg-[var(--color-interactive)]',
    getDescription: () => 'added a comment',
  },
  'task.file_uploaded': {
    icon: IconPaperclip,
    color: 'text-[var(--color-info-text)]',
    dotColor: 'bg-[var(--color-info)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `uploaded ${meta?.fileName || 'a file'}`
    },
  },
  'task.review_requested': {
    icon: IconGitPullRequest,
    color: 'text-[var(--color-warning-text)]',
    dotColor: 'bg-[var(--color-warning)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `requested review from ${meta?.reviewerName || 'a reviewer'}`
    },
  },
  'task.review_completed': {
    icon: IconCircleCheck,
    color: 'text-[var(--color-success-text)]',
    dotColor: 'bg-[var(--color-success)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `${meta?.status || 'reviewed'} the task`
    },
  },
  'task.visibility_changed': {
    icon: IconEye,
    color: 'text-[var(--color-text-tertiary)]',
    dotColor: 'bg-[var(--color-icon-secondary)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `changed visibility to ${meta?.visibility || 'unknown'}`
    },
  },
  'task.priority_changed': {
    icon: IconFlag,
    color: 'text-[var(--color-error-text)]',
    dotColor: 'bg-[var(--color-error)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `changed priority to ${meta?.priority || 'unknown'}`
    },
  },
  'task.labels_changed': {
    icon: IconTag,
    color: 'text-[var(--color-info-text)]',
    dotColor: 'bg-[var(--color-info)]',
    getDescription: () => 'updated labels',
  },
  'task.due_date_changed': {
    icon: IconCalendarEvent,
    color: 'text-[var(--color-warning-text)]',
    dotColor: 'bg-[var(--color-warning)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      if (meta?.dueDate) return `set due date to ${meta.dueDate}`
      return 'updated the due date'
    },
  },
}

const DEFAULT_ACTION: ActionConfig = {
  icon: IconActivity,
  color: 'text-[var(--color-text-placeholder)]',
  dotColor: 'bg-[var(--color-icon-disabled)]',
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
  const meta = entry.metadata as Record<string, unknown> | null
  if (meta?.actorName) return meta.actorName as string
  if (entry.actorType === 'SYSTEM') return 'System'
  if (entry.actorType === 'AGENT') return 'AI Agent'
  return 'Someone'
}

// ============================================================
// IconActivity Tab
// ============================================================

function ActivityTab({ activities, className }: ActivityTabProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={IconActivity}
        title="No activity yet"
        description="Actions on this task will appear here"
        compact
        className={className}
      />
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--color-border-default)]" />

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
              <div className="relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-layer-01)]">
                <div
                  className={cn(
                    'flex h-[var(--icon-md)] w-[var(--icon-md)] items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-layer-02)]',
                  )}
                >
                  <Icon
                    className={cn('h-3 w-3', config.color)}
                    stroke={2}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="B3-Reg">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {actorName}
                  </span>
                  <span className="text-[var(--color-text-tertiary)]">
                    {' '}{description}
                  </span>
                </p>
                <p className="mt-0.5 B4-Reg text-[var(--color-text-placeholder)]">
                  {formatTimestamp(entry.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

ActivityTab.displayName = 'ActivityTab'

export { ActivityTab }
export type { ActivityTabProps }
