'use client'

import * as React from 'react'
import { IconMessageCircle, IconPencil, IconTrash, IconArrowBackUp } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Icon } from '@/ui/icon'
import { ActivityFeed, type ActivityItem } from '@/composed/activity-feed'
import { formatRelativeTime } from '@/ui/lib/date-utils'
import { getInitials } from '@/composed/lib/string-utils'
import type { TimelineEntry, ClientMode } from '../tasks/v3/task-panel-types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type TimelineFilter = 'all' | 'comments' | 'activity' | 'reviews'

export interface TaskTimelineProps {
  entries: TimelineEntry[]
  filter?: TimelineFilter
  onFilterChange?: (filter: TimelineFilter) => void
  clientMode: ClientMode
  /** Timestamp of last view — entries after this get the "new" divider */
  lastViewedAt?: string | Date | null
  onReact?: (entryId: string, emoji: string) => void
  onReply?: (entryId: string) => void
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'comments', label: 'Comments' },
  { key: 'activity', label: 'Activity' },
  { key: 'reviews', label: 'Reviews' },
]

// ---------------------------------------------------------------------------
// System event collapsing — group 3+ consecutive events from the same actor
// within a 10-minute window into a single collapsed item
// ---------------------------------------------------------------------------

function collapseSystemEvents(entries: TimelineEntry[]): TimelineEntry[] {
  const result: TimelineEntry[] = []
  let i = 0

  while (i < entries.length) {
    const entry = entries[i]

    if (entry.type !== 'system-event') {
      result.push(entry)
      i++
      continue
    }

    // Collect consecutive system events from same actor within 10 min
    const group: TimelineEntry[] = [entry]
    let j = i + 1
    while (j < entries.length) {
      const next = entries[j]
      if (next.type !== 'system-event') break
      if (next.event.actorName !== entry.event.actorName) break
      const timeDiff = Math.abs(
        new Date(next.event.timestamp).getTime() -
          new Date(entry.event.timestamp).getTime(),
      )
      if (timeDiff > 10 * 60 * 1000) break // 10 min window
      group.push(next)
      j++
    }

    if (group.length >= 3) {
      // Collapse into a single merged event
      const descriptions = group
        .map((g) => (g as { type: 'system-event'; event: { description: string } }).event.description)
        .join(', ')
      result.push({
        type: 'system-event',
        event: {
          ...entry.event,
          id: `collapsed-${entry.event.id}`,
          description: descriptions,
        },
      } as TimelineEntry)
    } else {
      for (const g of group) result.push(g)
    }

    i = j
  }

  return result
}

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
  const ts = typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp

  return (
    <div className="group/comment flex gap-2 py-0.5">
      {/* Avatar — 20px to match ActivityFeed density */}
      <Avatar className="h-5 w-5 shrink-0 mt-0.5">
        {item.actor?.image && (
          <AvatarImage src={item.actor.image} alt={item.actor.name} />
        )}
        <AvatarFallback className="text-[8px] font-medium">
          {getInitials(item.actor?.name ?? '?')}
        </AvatarFallback>
      </Avatar>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Author + time on one line */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-medium text-surface-fg leading-tight">
            {item.actor?.name}
          </span>
          <time
            className="text-[11px] text-surface-fg-subtle/50 leading-tight"
            dateTime={ts.toISOString()}
          >
            {formatRelativeTime(item.timestamp)}
          </time>

          {/* Action buttons — inline with header, visible on hover */}
          {hasActions && (
            <div className="ml-auto flex gap-0.5 opacity-0 transition-opacity group-hover/comment:opacity-100">
              {onReply && (
                <button
                  type="button"
                  onClick={() => onReply(item.id)}
                  aria-label="Reply"
                  className="p-0.5 rounded-ds-sm text-surface-fg-subtle/40 hover:text-surface-fg hover:bg-surface-raised-hover transition-colors"
                >
                  <Icon icon={IconArrowBackUp} size="xs" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  aria-label="Edit"
                  className="p-0.5 rounded-ds-sm text-surface-fg-subtle/40 hover:text-surface-fg hover:bg-surface-raised-hover transition-colors"
                >
                  <Icon icon={IconPencil} size="xs" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label="Delete"
                  className="p-0.5 rounded-ds-sm text-surface-fg-subtle/40 hover:text-error-11 hover:bg-surface-raised-hover transition-colors"
                >
                  <Icon icon={IconTrash} size="xs" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment body */}
        <p className="mt-0.5 text-[13px] text-surface-fg-muted leading-relaxed whitespace-pre-wrap">
          {item.action}
        </p>
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
  lastViewedAt,
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
    if (filter === 'activity') {
      return entries.filter(
        (e) => e.type === 'system-event' || e.type === 'review-event',
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
      if (entry.type === 'system-event') return false
      return true
    })
  }, [typeFiltered, clientMode])

  // ---- Collapse consecutive system events from same actor ----
  const collapsed = React.useMemo(
    () => collapseSystemEvents(visibilityFiltered),
    [visibilityFiltered],
  )

  // ---- Compute "new" divider index ----
  const newDividerIndex = React.useMemo(() => {
    if (!lastViewedAt) return -1
    const threshold = new Date(lastViewedAt).getTime()
    for (let i = 0; i < collapsed.length; i++) {
      const entry = collapsed[i]
      const ts =
        entry.type === 'comment' ? entry.comment.createdAt :
        entry.type === 'system-event' ? entry.event.timestamp :
        entry.type === 'agent-response' ? entry.response.timestamp :
        entry.type === 'review-event' ? entry.event.timestamp : null
      if (ts && new Date(ts).getTime() > threshold) return i
    }
    return -1
  }, [collapsed, lastViewedAt])

  // ---- Map to ActivityItem[] ----
  const activityItems = React.useMemo(
    () => mapEntriesToActivityItems(collapsed),
    [collapsed],
  )

  // ---- Build a set of comment IDs for renderItem ----
  const commentIdSet = React.useMemo(() => {
    const set = new Set<string>()
    for (const entry of visibilityFiltered) {
      if (entry.type === 'comment') set.add(entry.comment.id)
    }
    return set
  }, [visibilityFiltered])

  // ---- Custom renderItem: comments get rich card, new divider, rest default ----
  const renderItem = React.useCallback(
    (item: ActivityItem, index: number): React.ReactNode | undefined => {
      const isComment = commentIdSet.has(item.id)
      const isNewDivider = index === newDividerIndex

      // Inject "new" divider before this item if it's the first unread entry
      const divider = isNewDivider ? (
        <div className="flex items-center gap-ds-02 mb-ds-02">
          <div className="flex-1 border-t border-error-7/50" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-error-9">New</span>
          <div className="flex-1 border-t border-error-7/50" />
        </div>
      ) : null

      if (!isComment) {
        // System events use default rendering — but we still need the divider
        if (divider) {
          return (
            <>
              {divider}
              {/* Return a fragment so ActivityFeed doesn't use default for this one */}
              <div className="text-ds-xs text-surface-fg-muted">
                <span className="font-medium text-surface-fg">{item.actor?.name}</span>
                {' '}{typeof item.action === 'string' ? item.action : ''}
                <span className="text-surface-fg-subtle/50 ml-ds-02">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            </>
          )
        }
        return undefined // default ActivityEntry
      }

      return (
        <>
          {divider}
          <CommentCard
            item={item}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </>
      )
    },
    [commentIdSet, newDividerIndex, onReply, onEdit, onDelete],
  )

  return (
    <div className={cn('flex flex-col gap-ds-03', className)}>
      {/* Filter toggle tabs */}
      {onFilterChange && (
        <div className="flex items-center gap-0.5 border-b border-surface-border-subtle pb-2 mb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={cn(
                'rounded-ds-md px-2 py-1 text-[11px] transition-colors',
                filter === f.key
                  ? 'bg-surface-raised-hover text-surface-fg font-medium'
                  : 'text-surface-fg-subtle/60 hover:text-surface-fg-muted hover:bg-surface-raised-hover/50',
              )}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}

          {/* New entries count */}
          {newDividerIndex >= 0 && (
            <span className="ml-auto text-[10px] font-semibold text-error-9 bg-error-3 rounded-ds-full px-1.5 py-0.5">
              {collapsed.length - newDividerIndex} new
            </span>
          )}
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
