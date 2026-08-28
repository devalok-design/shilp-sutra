'use client'

import { IconChevronRight } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { formatRelativeTime } from '../ui/lib/date-utils'
import type { IconInput } from '../ui/lib/icon-input'
import { tweens } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { getInitials } from './lib/string-utils'

export interface ActivityItem {
  id: string
  actor?: { name: string; image?: string }
  action: string | React.ReactNode
  timestamp: Date | string
  icon?: IconInput
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  detail?: React.ReactNode
}

export interface GroupLabels {
  today?: string
  yesterday?: string
  thisWeek?: string
  older?: string
}

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[]
  onLoadMore?: () => void
  loading?: boolean
  hasMore?: boolean
  emptyState?: React.ReactNode
  compact?: boolean
  maxInitialItems?: number
  groupBy?: 'time' | 'none'
  groupLabels?: GroupLabels
  /** Custom renderer per item. Return ReactNode for custom rendering, undefined to use default ActivityEntry. */
  renderItem?: (item: ActivityItem, index: number) => React.ReactNode | undefined
}

const dotColorMap = {
  default: 'bg-surface-fg-subtle',
  success: 'bg-success-9',
  warning: 'bg-warning-9',
  error: 'bg-error-9',
  info: 'bg-info-9',
} as const

const DEFAULT_GROUP_LABELS: Required<GroupLabels> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  older: 'Older',
}

/**
 * Buckets items into time-based groups: today, yesterday, earlier this week (since Monday), older.
 * Skips empty groups.
 */
export function groupItemsByTime(
  items: ActivityItem[],
  labels?: GroupLabels,
): { label: string; items: ActivityItem[] }[] {
  const l = { ...DEFAULT_GROUP_LABELS, ...labels }
  const now = new Date()

  // Start of today (midnight local)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // Start of yesterday
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)
  // Start of this week (Monday)
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon, ...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(
    startOfToday.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000,
  )

  const today: ActivityItem[] = []
  const yesterday: ActivityItem[] = []
  const thisWeek: ActivityItem[] = []
  const older: ActivityItem[] = []

  for (const item of items) {
    const ts =
      typeof item.timestamp === 'string'
        ? new Date(item.timestamp)
        : item.timestamp
    const t = ts.getTime()

    if (t >= startOfToday.getTime()) {
      today.push(item)
    } else if (t >= startOfYesterday.getTime()) {
      yesterday.push(item)
    } else if (t >= startOfWeek.getTime()) {
      thisWeek.push(item)
    } else {
      older.push(item)
    }
  }

  const groups: { label: string; items: ActivityItem[] }[] = []
  if (today.length > 0) groups.push({ label: l.today, items: today })
  if (yesterday.length > 0) groups.push({ label: l.yesterday, items: yesterday })
  if (thisWeek.length > 0) groups.push({ label: l.thisWeek, items: thisWeek })
  if (older.length > 0) groups.push({ label: l.older, items: older })

  return groups
}

function LoadingSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-3')}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-ds-03">
          <Skeleton className="h-2 w-2 shrink-0 rounded-pill" />
          {!compact && <Skeleton className="h-4 w-4 shrink-0 rounded-pill" />}
          <Skeleton className={cn('flex-1', compact ? 'h-3' : 'h-4')} />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

function ActivityEntry({
  item,
  compact,
}: {
  item: ActivityItem
  compact: boolean
}) {
  const [expandedDetail, setExpandedDetail] = React.useState(false)
  const detailId = React.useId()
  const color = item.color ?? 'default'

  const handleActionClick = () => {
    if (item.detail) {
      setExpandedDetail((prev) => !prev)
    }
  }

  return (
    <div className={cn('relative flex items-start', compact ? 'gap-ds-02' : 'gap-ds-03')}>
      {/* Dot */}
      <div
        className={cn(
          'relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-pill ring-2 ring-surface-panel',
          dotColorMap[color],
        )}
      />

      {/* Avatar (non-compact only) */}
      {!compact && item.actor && (
        <Avatar className="h-5 w-5 shrink-0 text-[9px]">
          {item.actor.image && (
            <AvatarImage src={item.actor.image} alt={item.actor.name} />
          )}
          <AvatarFallback className="text-[9px]">
            {getInitials(item.actor.name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-ds-02">
          <div className={cn('min-w-0 flex-1 flex items-center gap-ds-01 flex-wrap', compact ? 'text-body-xs' : 'text-body-sm')}>
            {item.actor && (
              <span className="font-medium text-surface-fg">{item.actor.name} </span>
            )}
            {item.detail && (
              <Icon icon={IconChevronRight} size="xs" className={cn('shrink-0 text-surface-fg-subtle transition-transform duration-fast-02 ease-productive-standard', expandedDetail && 'rotate-90')} />
            )}
            {item.detail ? (
              <button
                type="button"
                className="rounded-control text-surface-fg-muted hover:underline hover:bg-surface-panel-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
                onClick={handleActionClick}
                aria-expanded={expandedDetail}
                aria-controls={detailId}
              >
                {item.action}
              </button>
            ) : (
              <span className="text-surface-fg-muted">{item.action}</span>
            )}
          </div>

          <time
            className={cn(
              'shrink-0 whitespace-nowrap text-surface-fg-subtle',
              compact ? 'text-body-xs' : 'text-body-sm',
            )}
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

        {/* Expandable detail */}
        {expandedDetail && item.detail && (
          <div id={detailId} className="mt-ds-02 animate-in fade-in slide-in-from-top-1 text-body-sm text-surface-fg-muted">
            {item.detail}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Wraps custom renderItem content with the same dot + layout container
 * that ActivityEntry uses, keeping vertical rhythm consistent.
 */
function CustomEntry({
  item,
  compact,
  children,
}: {
  item: ActivityItem
  compact: boolean
  children: React.ReactNode
}) {
  const color = item.color ?? 'default'
  return (
    <div className={cn('relative flex items-start', compact ? 'gap-ds-02' : 'gap-ds-03')}>
      {/* Dot — same as ActivityEntry */}
      <div
        className={cn(
          'relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-pill ring-2 ring-surface-panel',
          dotColorMap[color],
        )}
      />
      {/* Custom content in the same flex slot as ActivityEntry's content area */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function GroupHeader({
  label,
  isFirst,
}: {
  label: string
  isFirst: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={tweens.fade}
      className={cn(
        'flex items-center gap-ds-03',
        !isFirst ? 'mt-ds-06' : '',
        'mb-ds-03',
      )}
    >
      <hr className="flex-1 border-surface-border" />
      <span className="bg-surface-panel px-ds-03 text-label-xs font-medium uppercase tracking-wider text-surface-fg-subtle">
        {label}
      </span>
      <hr className="flex-1 border-surface-border" />
    </motion.div>
  )
}

const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  (
    {
      items,
      onLoadMore,
      loading = false,
      hasMore = false,
      emptyState,
      compact = false,
      maxInitialItems,
      groupBy = 'none',
      groupLabels,
      renderItem,
      className,
      ...props
    },
    ref,
  ) => {
    const [showAll, setShowAll] = React.useState(false)

    if (loading) {
      return (
        <div ref={ref} className={cn('relative', className)} {...props}>
          <LoadingSkeleton compact={compact} />
        </div>
      )
    }

    if (items.length === 0) {
      if (emptyState) {
        return (
          <div ref={ref} className={className} {...props}>
            {emptyState}
          </div>
        )
      }
      return null
    }

    // maxInitialItems applies to the flat list BEFORE grouping
    const truncated =
      maxInitialItems != null && !showAll && items.length > maxInitialItems
    const visibleItems = truncated ? items.slice(0, maxInitialItems) : items

    const useGrouping = groupBy === 'time'

    /** Resolve what to render for a single item, respecting renderItem. */
    const resolveEntry = (item: ActivityItem, index: number) => {
      if (renderItem) {
        const custom = renderItem(item, index)
        if (custom !== undefined) {
          return <CustomEntry item={item} compact={compact}>{custom}</CustomEntry>
        }
      }
      return <ActivityEntry item={item} compact={compact} />
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Items */}
        {useGrouping ? (
          <div>
            {groupItemsByTime(visibleItems, groupLabels).map((group, gi) => (
              <div key={group.label}>
                <GroupHeader label={group.label} isFirst={gi === 0} />
                {/* Timeline line scoped to this group */}
                <div className={cn('relative flex flex-col', compact ? 'gap-1' : 'gap-3')}>
                  <div className="absolute bottom-0 left-[3px] top-0 w-px bg-surface-border" />
                  {group.items.map((item, index) => (
                    <motion.div key={item.id} initial={false} animate={{ opacity: 1 }} transition={{ ...tweens.fade, delay: index * 0.03 }}>
                      {resolveEntry(item, index)}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('relative flex flex-col', compact ? 'gap-1' : 'gap-3')}>
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[3px] top-0 w-px bg-surface-border" />
            {visibleItems.map((item, index) => (
              <motion.div key={item.id} initial={false} animate={{ opacity: 1 }} transition={{ ...tweens.fade, delay: index * 0.03 }}>
                {resolveEntry(item, index)}
              </motion.div>
            ))}
          </div>
        )}

        {/* Show all button */}
        {truncated && (
          <div className="relative mt-ds-03 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
            >
              Show all ({items.length})
            </Button>
          </div>
        )}

        {/* Load more button */}
        {hasMore && onLoadMore && !truncated && (
          <div className="relative mt-ds-03 flex justify-center">
            <Button variant="ghost" size="sm" onClick={onLoadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    )
  },
)
ActivityFeed.displayName = 'ActivityFeed'

export { ActivityFeed }
