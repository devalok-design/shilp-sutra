'use client'

import * as React from 'react'
import { IconMessageCircle, IconPencil, IconTrash, IconArrowBackUp } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { ActivityFeed, type ActivityItem } from '@/composed/activity-feed'
import { formatRelativeTime } from '@/ui/lib/date-utils'
import { getInitials } from '@/composed/lib/string-utils'
import type { TimelineEntry, ClientMode } from '../tasks/v3/task-panel-types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TaskTimelineProps {
  entries: TimelineEntry[]
  filter?: 'all' | 'comments' | 'reviews'
  onFilterChange?: (filter: 'all' | 'comments' | 'reviews') => void
  clientMode: ClientMode
  onReact?: (entryId: string, emoji: string) => void
  onReply?: (entryId: string) => void
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FilterValue = 'all' | 'comments' | 'reviews'

const FILTERS: { key: FilterValue; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'comments', label: 'Comments' },
  { key: 'reviews', label: 'Reviews' },
]

const reviewActionColorMap: Record<string, ActivityItem['color']> = {
  submitted: 'info',
  approved: 'success',
  'changes-requested': 'warning',
}

const systemActionColorMap: Record<string, ActivityItem['color']> = {
  'status-change': 'info',
  assignment: 'default',
  priority: 'warning',
  'label-add': 'default',
  'label-remove': 'default',
  'due-date': 'default',
  visibility: 'default',
}

// ---------------------------------------------------------------------------
// Comment author name + image helpers (using the Comment type directly)
// ---------------------------------------------------------------------------

function resolveAuthor(comment: { internalAuthor?: { name: string; image?: string | null } | null; clientAuthor?: { name: string } | null }): { name: string; image?: string } {
  const name = comment.internalAuthor?.name ?? comment.clientAuthor?.name ?? 'Unknown'
  const image = comment.internalAuthor?.image ?? undefined
  return { name, image: image ?? undefined }
}

// ---------------------------------------------------------------------------
// Map TimelineEntry[] → ActivityItem[]
// ---------------------------------------------------------------------------

function mapEntriesToActivityItems(entries: TimelineEntry[]): ActivityItem[] {
  return entries.map((entry): ActivityItem => {
    switch (entry.type) {
      case 'comment': {
        const author = resolveAuthor(entry.comment)
        return {
          id: entry.comment.id,
          actor: { name: author.name, image: author.image },
          action: entry.comment.content,
          timestamp: entry.comment.createdAt,
          color: 'default',
        }
      }
      case 'system-event':
        return {
          id: entry.event.id,
          actor: { name: entry.event.actorName },
          action: entry.event.description,
          timestamp: entry.event.timestamp,
          color: systemActionColorMap[entry.event.action] ?? 'default',
        }
      case 'agent-response':
        return {
          id: entry.response.id,
          actor: { name: entry.response.agentName },
          action: entry.response.content,
          timestamp: entry.response.timestamp,
          color: 'info',
        }
      case 'review-event':
        return {
          id: entry.event.id,
          actor: { name: entry.event.reviewerName },
          action: formatReviewAction(entry.event.action, entry.event.comment),
          timestamp: entry.event.timestamp,
          color: reviewActionColorMap[entry.event.action] ?? 'default',
        }
    }
  })
}

function formatReviewAction(action: string, comment?: string): string {
  const labels: Record<string, string> = {
    submitted: 'submitted a review',
    approved: 'approved',
    'changes-requested': 'requested changes',
  }
  const label = labels[action] ?? action
  return comment ? `${label}: ${comment}` : label
}

// ---------------------------------------------------------------------------
// Comment card (renderItem for comments)
// ---------------------------------------------------------------------------

interface CommentCardProps {
  item: ActivityItem
  onReply?: (entryId: string) => void
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
}

function CommentCard({ item, onReply, onEdit, onDelete }: CommentCardProps) {
  const hasActions = onReply || onEdit || onDelete

  return (
    <div className="group/comment flex gap-ds-03">
      {/* Avatar */}
      <Avatar className="h-6 w-6 shrink-0 text-[10px]">
        {item.actor?.image && (
          <AvatarImage src={item.actor.image} alt={item.actor.name} />
        )}
        <AvatarFallback className="text-[10px]">
          {getInitials(item.actor?.name ?? '?')}
        </AvatarFallback>
      </Avatar>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-ds-02">
          <span className="text-ds-sm font-medium text-surface-fg">
            {item.actor?.name}
          </span>
          <time
            className="text-ds-xs text-surface-fg-subtle"
            dateTime={
              (typeof item.timestamp === 'string'
                ? new Date(item.timestamp)
                : item.timestamp
              ).toISOString()
            }
          >
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>

        <p className="mt-ds-01 text-ds-sm text-surface-fg-muted whitespace-pre-wrap">
          {item.action}
        </p>

        {/* Action buttons — visible on hover */}
        {hasActions && (
          <div className="mt-ds-01 flex gap-ds-01 opacity-0 transition-opacity group-hover/comment:opacity-100">
            {onReply && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onReply(item.id)}
                aria-label="Reply"
              >
                <Icon icon={IconArrowBackUp} size="xs" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onEdit(item.id)}
                aria-label="Edit"
              >
                <Icon icon={IconPencil} size="xs" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onDelete(item.id)}
                aria-label="Delete"
              >
                <Icon icon={IconTrash} size="xs" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskTimeline
// ---------------------------------------------------------------------------

export function TaskTimeline({
  entries,
  filter = 'all',
  onFilterChange,
  clientMode,
  onReact: _onReact,
  onReply,
  onEdit,
  onDelete,
  className,
}: TaskTimelineProps) {
  // ---- Filter by type ----
  const typeFiltered = React.useMemo(() => {
    if (filter === 'all') return entries
    if (filter === 'comments') {
      return entries.filter(
        (e) => e.type === 'comment' || e.type === 'agent-response',
      )
    }
    // 'reviews'
    return entries.filter((e) => e.type === 'review-event')
  }, [entries, filter])

  // ---- Filter by clientMode — hide internal comments from clients ----
  const visibilityFiltered = React.useMemo(() => {
    if (!clientMode) return typeFiltered
    return typeFiltered.filter((entry) => {
      if (entry.type === 'comment' && entry.comment.authorType === 'INTERNAL') {
        return false
      }
      // Also hide system events from clients (matches task-panel-timeline behavior)
      if (entry.type === 'system-event') return false
      return true
    })
  }, [typeFiltered, clientMode])

  // ---- Map to ActivityItem[] ----
  const activityItems = React.useMemo(
    () => mapEntriesToActivityItems(visibilityFiltered),
    [visibilityFiltered],
  )

  // ---- Build a set of comment IDs for renderItem ----
  const commentIdSet = React.useMemo(() => {
    const set = new Set<string>()
    for (const entry of visibilityFiltered) {
      if (entry.type === 'comment') set.add(entry.comment.id)
    }
    return set
  }, [visibilityFiltered])

  // ---- Custom renderItem: comments get rich card, rest use default ----
  const renderItem = React.useCallback(
    (item: ActivityItem, _index: number): React.ReactNode | undefined => {
      if (!commentIdSet.has(item.id)) return undefined
      return (
        <CommentCard
          item={item}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    },
    [commentIdSet, onReply, onEdit, onDelete],
  )

  return (
    <div className={cn('flex flex-col gap-ds-03', className)}>
      {/* Filter toggle tabs */}
      {onFilterChange && (
        <div className="flex gap-ds-01">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant="ghost"
              size="xs"
              className={cn(
                'rounded-full px-ds-03 text-ds-xs',
                filter === f.key &&
                  'bg-surface-raised text-surface-fg font-medium',
              )}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {/* Activity feed */}
      <ActivityFeed
        items={activityItems}
        groupBy="time"
        renderItem={renderItem}
        emptyState={
          <div className="flex flex-col items-center justify-center py-ds-08 text-center">
            <Icon
              icon={IconMessageCircle}
              size="lg"
              className="text-surface-fg-subtle/40"
            />
            <p className="mt-ds-02 text-ds-sm text-surface-fg-subtle">
              {clientMode ? 'No updates yet' : 'No timeline entries'}
            </p>
          </div>
        }
      />
    </div>
  )
}

TaskTimeline.displayName = 'TaskTimeline'
