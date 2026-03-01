'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { EmptyState } from '../../shared/empty-state'
import {
  Activity,
  ArrowRight,
  MessageSquare,
  Paperclip,
  UserPlus,
  UserMinus,
  Flag,
  Eye,
  Tag,
  CalendarDays,
  Plus,
  GitPullRequest,
  CheckCircle,
  Edit3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
  icon: LucideIcon
  color: string
  dotColor: string
  getDescription: (entry: AuditLogEntry) => string
}

const ACTION_MAP: Record<string, ActionConfig> = {
  'task.created': {
    icon: Plus,
    color: 'text-[var(--green-500)]',
    dotColor: 'bg-[var(--green-500)]',
    getDescription: () => 'created this task',
  },
  'task.updated': {
    icon: Edit3,
    color: 'text-[var(--blue-300)]',
    dotColor: 'bg-[var(--blue-300)]',
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
    icon: ArrowRight,
    color: 'text-[var(--yellow-500)]',
    dotColor: 'bg-[var(--yellow-500)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      const from = meta?.fromColumn || 'unknown'
      const to = meta?.toColumn || 'unknown'
      return `moved from ${from} to ${to}`
    },
  },
  'task.assigned': {
    icon: UserPlus,
    color: 'text-[var(--blue-300)]',
    dotColor: 'bg-[var(--blue-300)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `assigned ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.unassigned': {
    icon: UserMinus,
    color: 'text-[var(--neutral-400)]',
    dotColor: 'bg-[var(--neutral-400)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `removed ${meta?.assigneeName || 'a user'}`
    },
  },
  'task.commented': {
    icon: MessageSquare,
    color: 'text-[var(--color-interactive)]',
    dotColor: 'bg-[var(--color-interactive)]',
    getDescription: () => 'added a comment',
  },
  'task.file_uploaded': {
    icon: Paperclip,
    color: 'text-[var(--blue-300)]',
    dotColor: 'bg-[var(--blue-300)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `uploaded ${meta?.fileName || 'a file'}`
    },
  },
  'task.review_requested': {
    icon: GitPullRequest,
    color: 'text-[var(--yellow-500)]',
    dotColor: 'bg-[var(--yellow-500)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `requested review from ${meta?.reviewerName || 'a reviewer'}`
    },
  },
  'task.review_completed': {
    icon: CheckCircle,
    color: 'text-[var(--green-500)]',
    dotColor: 'bg-[var(--green-500)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `${meta?.status || 'reviewed'} the task`
    },
  },
  'task.visibility_changed': {
    icon: Eye,
    color: 'text-[var(--color-text-tertiary)]',
    dotColor: 'bg-[var(--neutral-500)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `changed visibility to ${meta?.visibility || 'unknown'}`
    },
  },
  'task.priority_changed': {
    icon: Flag,
    color: 'text-[var(--red-300)]',
    dotColor: 'bg-[var(--red-300)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      return `changed priority to ${meta?.priority || 'unknown'}`
    },
  },
  'task.labels_changed': {
    icon: Tag,
    color: 'text-[var(--blue-300)]',
    dotColor: 'bg-[var(--blue-300)]',
    getDescription: () => 'updated labels',
  },
  'task.due_date_changed': {
    icon: CalendarDays,
    color: 'text-[var(--yellow-500)]',
    dotColor: 'bg-[var(--yellow-500)]',
    getDescription: (entry) => {
      const meta = entry.metadata as Record<string, unknown> | null
      if (meta?.dueDate) return `set due date to ${meta.dueDate}`
      return 'updated the due date'
    },
  },
}

const DEFAULT_ACTION: ActionConfig = {
  icon: Activity,
  color: 'text-[var(--color-text-placeholder)]',
  dotColor: 'bg-[var(--neutral-400)]',
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
// Activity Tab
// ============================================================

function ActivityTab({ activities, className }: ActivityTabProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
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
      <div className="space-y-4">
        {activities.map((entry) => {
          const config = ACTION_MAP[entry.action] || DEFAULT_ACTION
          const Icon = config.icon
          const actorName = getActorName(entry)
          const description = config.getDescription(entry)

          return (
            <div key={entry.id} className="relative flex gap-3 pl-0">
              {/* Dot on timeline */}
              <div className="relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--color-layer-01)]">
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-layer-02)]',
                  )}
                >
                  <Icon
                    className={cn('h-3 w-3', config.color)}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[12px] font-body leading-snug">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {actorName}
                  </span>
                  <span className="text-[var(--color-text-tertiary)]">
                    {' '}{description}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] font-body text-[var(--color-text-placeholder)]">
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
