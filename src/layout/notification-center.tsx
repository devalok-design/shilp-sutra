'use client'

/**
 * NotificationCenter -- Popover-based notification panel.
 *
 * Props-driven: accepts notifications array and callbacks instead of
 * reading from Zustand stores or using Remix useNavigate.
 */
import * as React from 'react'
import { useRef, useCallback } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip'
import { IconBell, IconChecks, IconInbox } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface Notification {
  id: string
  title: string
  body?: string | null
  tier: 'INFO' | 'IMPORTANT' | 'CRITICAL'
  isRead: boolean
  createdAt: string
  entityType?: string | null
  entityId?: string | null
  projectId?: string | null
  project?: { title: string } | null
}

export interface NotificationCenterProps {
  /** List of notifications to display */
  notifications?: Notification[]
  /** Count of unread notifications (derived from notifications if not provided) */
  unreadCount?: number
  /** Whether the popover is open (controlled mode) */
  open?: boolean
  /** Called when the popover open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether more notifications are loading */
  isLoading?: boolean
  /** Whether there are more notifications to fetch */
  hasMore?: boolean
  /** Called when the user scrolls near the bottom to load more */
  onFetchMore?: () => void
  /** Called to mark a single notification as read */
  onMarkRead?: (id: string) => void
  /** Called to mark all notifications as read */
  onMarkAllRead?: () => void
  /** Called when the user clicks a notification (e.g., navigate to entity) */
  onNavigate?: (path: string) => void
  /** Resolve a notification to a navigation path. Return null if no navigation. */
  getNotificationRoute?: (notification: Notification) => string | null
  /** Additional className */
  className?: string
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return 'Earlier'
}

const TIER_COLORS: Record<string, string> = {
  INFO: 'bg-[var(--color-info)]',
  IMPORTANT: 'bg-[var(--color-warning)]',
  CRITICAL: 'bg-[var(--color-error)]',
}

// -----------------------------------------------------------------------
// Default entity route resolver
// -----------------------------------------------------------------------

function defaultGetEntityRoute(notification: Notification): string | null {
  if (!notification.entityType) return null

  switch (notification.entityType) {
    case 'TASK':
      return notification.projectId
        ? `/projects/${notification.projectId}/board`
        : null
    case 'BREAK_REQUEST':
      return '/breaks'
    case 'ATTENDANCE':
      return '/attendance'
    case 'CLIENT_REQUEST':
      return notification.projectId
        ? `/projects/${notification.projectId}/requests`
        : null
    case 'REVIEW_REQUEST':
      return notification.projectId
        ? `/projects/${notification.projectId}/board`
        : null
    case 'PROJECT':
      return notification.projectId
        ? `/projects/${notification.projectId}/board`
        : '/projects'
    default:
      return null
  }
}

// -----------------------------------------------------------------------
// NotificationItem (internal)
// -----------------------------------------------------------------------

function NotificationItem({
  notification,
  onRead,
  onNavigate,
  getRoute,
}: {
  notification: Notification
  onRead: (id: string) => void
  onNavigate: (path: string) => void
  getRoute: (notification: Notification) => string | null
}) {
  const route = getRoute(notification)

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
    if (route) {
      onNavigate(route)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-[var(--color-layer-02)]',
        !notification.isRead && 'bg-[var(--color-interactive)]/[0.03]',
      )}
    >
      {/* Tier indicator dot */}
      <div className="mt-1.5 flex shrink-0">
        <span
          className={cn(
            'h-2 w-2 rounded-[var(--radius-full)]',
            TIER_COLORS[notification.tier] || TIER_COLORS.INFO,
            notification.isRead && 'opacity-40',
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm text-[var(--color-text-primary)]',
            !notification.isRead && 'font-semibold',
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-placeholder)]">
            {notification.body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-placeholder)]">
            {timeAgo(notification.createdAt)}
          </span>
          {notification.project && (
            <>
              <span className="text-[var(--color-text-placeholder)]">
                &middot;
              </span>
              <span className="truncate text-xs text-[var(--color-text-placeholder)]">
                {notification.project.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="mt-1.5 shrink-0">
          <span className="block h-2 w-2 rounded-[var(--radius-full)] bg-[var(--color-interactive)]" />
        </div>
      )}
    </button>
  )
}

// -----------------------------------------------------------------------
// NotificationCenter
// -----------------------------------------------------------------------

const NotificationCenter = React.forwardRef<HTMLButtonElement, NotificationCenterProps>(
  (
    {
      notifications = [],
      unreadCount: unreadCountProp,
      open,
      onOpenChange,
      isLoading = false,
      hasMore = false,
      onFetchMore,
      onMarkRead,
      onMarkAllRead,
      onNavigate,
      getNotificationRoute,
      className,
    },
    ref,
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null)

  const unreadCount =
    unreadCountProp ?? notifications.filter((n) => !n.isRead).length

  const getRoute = getNotificationRoute ?? defaultGetEntityRoute

  const handleNavigate = useCallback(
    (path: string) => {
      onOpenChange?.(false)
      onNavigate?.(path)
    },
    [onNavigate, onOpenChange],
  )

  const handleMarkRead = useCallback(
    (id: string) => {
      onMarkRead?.(id)
    },
    [onMarkRead],
  )

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || isLoading || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      onFetchMore?.()
    }
  }, [isLoading, hasMore, onFetchMore])

  // Group notifications by date
  const grouped = notifications.reduce<Record<string, Notification[]>>(
    (acc, n) => {
      const group = getDateGroup(n.createdAt)
      if (!acc[group]) acc[group] = []
      acc[group].push(n)
      return acc
    },
    {},
  )

  const groupOrder = ['Today', 'Yesterday', 'Earlier']

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-layer-02)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-03)]',
                className,
              )}
            >
              <IconBell className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-interactive)] px-1 text-[10px] font-bold text-[var(--color-text-on-color)]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          Notifications
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-[380px] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0 shadow-03"
        sideOffset={8}
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-interactive)]/10 px-1.5 text-[11px] font-semibold text-[var(--color-interactive)]">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-interactive)]"
            >
              <IconChecks className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[420px] overflow-y-auto"
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-layer-02)]">
                <IconInbox className="h-6 w-6 text-[var(--color-text-placeholder)]" />
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-placeholder)]">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-placeholder)]">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            groupOrder.map((group) => {
              const items = grouped[group]
              if (!items || items.length === 0) return null
              return (
                <div key={group}>
                  <div className="sticky top-0 z-raised bg-[var(--color-layer-01)] px-4 py-1.5">
                    <span className="text-xs font-medium text-[var(--color-text-placeholder)]">
                      {group}
                    </span>
                  </div>
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={handleMarkRead}
                      onNavigate={handleNavigate}
                      getRoute={getRoute}
                    />
                  ))}
                </div>
              )
            })
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-[var(--icon-md)] w-[var(--icon-md)] animate-spin rounded-[var(--radius-full)] border-2 border-[var(--color-border-default)] border-t-[var(--color-interactive)]" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
    )
  },
)
NotificationCenter.displayName = 'NotificationCenter'

export { NotificationCenter }
