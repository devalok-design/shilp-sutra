'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { getInitials } from './lib/string-utils'

export interface ActivityItem {
  id: string
  actor?: { name: string; image?: string }
  action: string | React.ReactNode
  timestamp: Date | string
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  detail?: React.ReactNode
}

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[]
  onLoadMore?: () => void
  loading?: boolean
  hasMore?: boolean
  emptyState?: React.ReactNode
  compact?: boolean
  maxInitialItems?: number
}

const dotColorMap = {
  default: 'bg-text-placeholder',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-interactive',
} as const

function formatRelativeTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function LoadingSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-3')}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-ds-03">
          <Skeleton className="h-2 w-2 shrink-0 rounded-ds-full" />
          {!compact && <Skeleton className="h-4 w-4 shrink-0 rounded-ds-full" />}
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
  const [expanded, setExpanded] = React.useState(false)
  const color = item.color ?? 'default'

  const handleActionClick = () => {
    if (item.detail) {
      setExpanded((prev) => !prev)
    }
  }

  return (
    <div className={cn('relative flex items-start', compact ? 'gap-ds-02' : 'gap-ds-03')}>
      {/* Dot */}
      <div
        className={cn(
          'relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-ds-full ring-2 ring-surface',
          dotColorMap[color],
        )}
      />

      {/* Avatar (non-compact only) */}
      {!compact && item.actor && (
        <Avatar className="h-4 w-4 shrink-0 text-[8px]">
          {item.actor.image && (
            <AvatarImage src={item.actor.image} alt={item.actor.name} />
          )}
          <AvatarFallback className="text-[8px]">
            {getInitials(item.actor.name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-ds-02">
          <div className={cn('min-w-0 flex-1', compact ? 'text-ds-xs' : 'text-ds-sm')}>
            {item.actor && (
              <span className="font-medium text-text-primary">{item.actor.name} </span>
            )}
            <span
              className={cn(
                'text-text-secondary',
                item.detail && 'cursor-pointer hover:underline',
              )}
              onClick={handleActionClick}
              role={item.detail ? 'button' : undefined}
              tabIndex={item.detail ? 0 : undefined}
              onKeyDown={
                item.detail
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleActionClick()
                      }
                    }
                  : undefined
              }
            >
              {item.action}
            </span>
          </div>

          <time
            className={cn(
              'shrink-0 whitespace-nowrap text-text-placeholder',
              compact ? 'text-ds-xs' : 'text-ds-xs',
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
        {expanded && item.detail && (
          <div className="mt-ds-02 animate-in fade-in slide-in-from-top-1 text-ds-sm text-text-secondary">
            {item.detail}
          </div>
        )}
      </div>
    </div>
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

    const truncated =
      maxInitialItems != null && !showAll && items.length > maxInitialItems
    const visibleItems = truncated ? items.slice(0, maxInitialItems) : items

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Timeline line */}
        <div className="absolute bottom-0 left-[3px] top-0 w-px bg-border" />

        {/* Items */}
        <div className={cn('relative flex flex-col', compact ? 'gap-1' : 'gap-3')}>
          {visibleItems.map((item) => (
            <ActivityEntry key={item.id} item={item} compact={compact} />
          ))}
        </div>

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
