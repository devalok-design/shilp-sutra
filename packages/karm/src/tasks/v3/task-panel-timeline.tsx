'use client'

import * as React from 'react'
import { IconChevronDown, IconMessageCircle, IconRobot } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { Badge } from '@/ui/badge'
import { EmptyState } from '@/composed/empty-state'
import { MotionCollapse } from '@/motion/primitives'
import { StreamingText } from '../../chat/streaming-text'
import { useTaskPanel } from './task-panel-context'
import type { TimelineEntry, SystemEvent } from './task-panel-types'
import { TimelineEntryRenderer } from './timeline/timeline-entry'

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type TimelineFilter = 'all' | 'comments' | 'activity' | 'files'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getEntryTimestamp(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'comment':
      return entry.comment.createdAt
    case 'system-event':
      return entry.event.timestamp
    case 'review-event':
      return entry.event.timestamp
    case 'agent-response':
      return entry.response.timestamp
  }
}

function getDateKey(timestamp: string): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatDateDivider(timestamp: string): string {
  const d = new Date(timestamp)
  const now = new Date()

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()

  if (d.getFullYear() === now.getFullYear()) return `${month} ${day}`
  return `${month} ${day}, ${d.getFullYear()}`
}

function getEntryId(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'comment':
      return entry.comment.id
    case 'system-event':
      return entry.event.id
    case 'review-event':
      return entry.event.id
    case 'agent-response':
      return entry.response.id
  }
}

// ---------------------------------------------------------------------------
// Smart collapsing — group consecutive system events by same actor within 10min
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Comment grouping — consecutive comments from same author within 5 minutes
// ---------------------------------------------------------------------------

function computeCommentGrouping(entries: TimelineEntry[]): boolean[] {
  return entries.map((entry, i) => {
    if (entry.type !== 'comment') return false
    const prev = entries[i - 1]
    if (!prev || prev.type !== 'comment') return false
    if (prev.comment.authorId !== entry.comment.authorId) return false
    const timeDiff = Math.abs(
      new Date(entry.comment.createdAt).getTime() -
        new Date(prev.comment.createdAt).getTime(),
    )
    return timeDiff < 5 * 60 * 1000
  })
}

// ---------------------------------------------------------------------------
// Smart collapsing — group consecutive system events by same actor within 10min
// ---------------------------------------------------------------------------

interface CollapsedGroup {
  kind: 'collapsed'
  actorName: string
  entries: Array<Extract<TimelineEntry, { type: 'system-event' }>>
  latestTimestamp: string
}

interface SingleEntry {
  kind: 'single'
  entry: TimelineEntry
  /** True when this comment continues a group from the same author. */
  isGrouped: boolean
}

type DisplayItem = CollapsedGroup | SingleEntry

function buildDisplayItems(entries: TimelineEntry[]): DisplayItem[] {
  const groupFlags = computeCommentGrouping(entries)
  const items: DisplayItem[] = []
  let i = 0

  while (i < entries.length) {
    const current = entries[i]

    if (current.type === 'system-event') {
      // Try to group consecutive system events by the same actor within 10 min
      const group: Array<Extract<TimelineEntry, { type: 'system-event' }>> = [current]
      let j = i + 1

      while (j < entries.length) {
        const next = entries[j]
        if (next.type !== 'system-event') break
        if (next.event.actorId !== current.event.actorId) break

        const timeDiff = Math.abs(
          new Date(next.event.timestamp).getTime() -
            new Date(current.event.timestamp).getTime(),
        )
        if (timeDiff > 10 * 60 * 1000) break

        group.push(next)
        j++
      }

      if (group.length >= 3) {
        items.push({
          kind: 'collapsed',
          actorName: current.event.actorName,
          entries: group,
          latestTimestamp: group[group.length - 1].event.timestamp,
        })
        i = j
      } else {
        // Not enough to collapse — push individually
        for (let k = 0; k < group.length; k++) {
          const idx = i + k
          items.push({ kind: 'single', entry: group[k], isGrouped: groupFlags[idx] })
        }
        i = j
      }
    } else {
      items.push({ kind: 'single', entry: current, isGrouped: groupFlags[i] })
      i++
    }
  }

  return items
}

// ---------------------------------------------------------------------------
// Collapsed group component
// ---------------------------------------------------------------------------

function CollapsedSystemGroup({ group }: { group: CollapsedGroup }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="flex flex-col gap-ds-01">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle hover:text-surface-fg transition-colors"
      >
        <span className="font-semibold text-surface-fg">
          {group.actorName}
        </span>
        <span>
          made {group.entries.length} changes
        </span>
        <span>&middot;</span>
        <span>{timeAgo(group.latestTimestamp)}</span>
        <IconChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <MotionCollapse show={expanded}>
        <div className="flex flex-col gap-ds-02 pl-ds-02">
          {group.entries.map((entry) => (
            <TimelineEntryRenderer
              key={entry.event.id}
              entry={entry}
              currentUserId={null}
              onReact={() => {}}
            />
          ))}
        </div>
      </MotionCollapse>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Date divider
// ---------------------------------------------------------------------------

function DateDivider({ timestamp }: { timestamp: string }) {
  return (
    <div className="flex items-center gap-ds-03 py-ds-03">
      <div className="flex-1 border-t border-surface-border-subtle" />
      <span className="text-[10px] font-medium text-surface-fg-subtle/50 uppercase tracking-wider">
        {formatDateDivider(timestamp)}
      </span>
      <div className="flex-1 border-t border-surface-border-subtle" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Unread divider
// ---------------------------------------------------------------------------

function UnreadDivider() {
  return (
    <div className="relative flex items-center py-ds-02">
      <div className="flex-1 border-t-2 border-dashed border-accent-7" />
      <span className="px-ds-03 text-ds-xs font-semibold text-accent-11">
        NEW
      </span>
      <div className="flex-1 border-t-2 border-dashed border-accent-7" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator({ users }: { users: { name: string; image?: string | null }[] }) {
  if (users.length === 0) return null

  const names =
    users.length === 1
      ? users[0].name
      : users.length === 2
        ? `${users[0].name} and ${users[1].name}`
        : `${users[0].name} and ${users.length - 1} others`

  return (
    <div className="flex items-center gap-ds-02 px-ds-02 py-ds-01 text-ds-xs text-surface-fg-subtle">
      {/* Animated dots */}
      <span className="flex gap-[2px]">
        <span className="h-1 w-1 animate-bounce rounded-full bg-surface-fg-subtle [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-surface-fg-subtle [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-surface-fg-subtle [animation-delay:300ms]" />
      </span>
      <span>{names} is typing...</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'comments', label: 'Comments' },
  { key: 'activity', label: 'Activity' },
]

function FilterBar({
  value,
  onChange,
}: {
  value: TimelineFilter
  onChange: (filter: TimelineFilter) => void
}) {
  return (
    <div className="flex items-center gap-ds-01 px-ds-02 pb-ds-02">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={cn(
            'rounded-full px-ds-03 py-ds-01 text-ds-xs transition-colors',
            value === f.key
              ? 'bg-accent-3 text-accent-11'
              : 'bg-surface-raised-hover text-surface-fg-subtle hover:text-surface-fg',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TaskPanelTimeline
// ---------------------------------------------------------------------------

export interface TaskPanelTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelTimeline({
  className,
  ...props
}: TaskPanelTimelineProps) {
  const {
    timeline,
    lastViewedAt,
    clientMode,
    mode,
    currentUserId,
    onReact,
    onEditComment,
    onDeleteComment,
    typingUsers,
    isAgentStreaming,
    agentStreamingText,
  } = useTaskPanel()

  const [filter, setFilter] = React.useState<TimelineFilter>('all')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const prevLengthRef = React.useRef(timeline.length)
  const [userScrolledUp, setUserScrolledUp] = React.useState(false)
  const [newCount, setNewCount] = React.useState(0)

  const isPeek = mode === 'peek'

  // ---- Client filtering ----
  const clientFiltered = React.useMemo(() => {
    if (!clientMode) return timeline
    return timeline.filter((entry) => {
      if (entry.type === 'system-event') return false
      if (
        entry.type === 'comment' &&
        entry.comment.authorType === 'INTERNAL'
      )
        return false
      return true
    })
  }, [timeline, clientMode])

  // ---- Type filtering (staff only, hidden in peek) ----
  const filtered = React.useMemo(() => {
    if (isPeek) return clientFiltered.slice(-2)
    if (filter === 'all') return clientFiltered
    if (filter === 'comments') {
      return clientFiltered.filter(
        (e) => e.type === 'comment' || e.type === 'agent-response',
      )
    }
    if (filter === 'activity') {
      return clientFiltered.filter(
        (e) => e.type === 'system-event' || e.type === 'review-event',
      )
    }
    return clientFiltered
  }, [clientFiltered, filter, isPeek])

  // ---- Build display items with smart collapsing ----
  const displayItems = React.useMemo(
    () => buildDisplayItems(filtered),
    [filtered],
  )

  // ---- Find unread divider position ----
  const unreadAfterIndex = React.useMemo(() => {
    if (!lastViewedAt) return -1
    const viewedTime = new Date(lastViewedAt).getTime()
    for (let i = filtered.length - 1; i >= 0; i--) {
      const ts = new Date(getEntryTimestamp(filtered[i])).getTime()
      if (ts <= viewedTime) return i
    }
    return -1
  }, [filtered, lastViewedAt])

  // ---- Auto-scroll ----
  const scrollToBottom = React.useCallback(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  React.useEffect(() => {
    if (timeline.length > prevLengthRef.current) {
      if (userScrolledUp) {
        setNewCount((c) => c + (timeline.length - prevLengthRef.current))
      } else {
        scrollToBottom()
      }
    }
    prevLengthRef.current = timeline.length
  }, [timeline.length, userScrolledUp, scrollToBottom])

  // Initial scroll to bottom
  React.useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setUserScrolledUp(!atBottom)
    if (atBottom) setNewCount(0)
  }, [])

  // ---- Empty state ----
  if (filtered.length === 0 && !isPeek) {
    return (
      <div className={cn('flex flex-1 flex-col', className)} {...props}>
        {!clientMode && (
          <FilterBar value={filter} onChange={setFilter} />
        )}
        <div className="flex flex-1 items-center justify-center p-ds-05">
          <EmptyState
            compact
            icon={IconMessageCircle}
            title={
              clientMode
                ? 'No updates yet'
                : 'Start the conversation'
            }
            description={
              clientMode
                ? "We'll post progress as work begins"
                : 'Your team will see updates here'
            }
          />
        </div>
      </div>
    )
  }

  // ---- Render timeline ----
  // For the unread divider, we need to track position within the
  // original filtered list. We'll walk displayItems and track the
  // index into `filtered`.
  let filteredIdx = 0
  let prevDateKey = ''

  return (
    <div className={cn('flex flex-1 flex-col overflow-hidden', className)} {...props}>
      {/* Filter bar — staff only, not in peek */}
      {!clientMode && !isPeek && (
        <div className="pt-ds-04 pb-0">
          <FilterBar value={filter} onChange={setFilter} />
        </div>
      )}

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-ds-06 py-ds-04"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-surface-border) transparent' }}
      >
        {/* Fade-in gradient at top of scroll area */}
        {!clientMode && !isPeek && (
          <div className="pointer-events-none sticky top-0 left-0 right-0 z-10 h-3 -mb-3 bg-gradient-to-b from-surface-raised to-transparent" />
        )}
        <div className="flex flex-col gap-ds-05 py-ds-03">
          {displayItems.map((item, idx) => {
            // Determine timestamp and date key for this item
            const itemTimestamp =
              item.kind === 'collapsed'
                ? item.entries[0].event.timestamp
                : getEntryTimestamp(item.entry)
            const dateKey = getDateKey(itemTimestamp)
            const showDateDivider = !isPeek && dateKey !== prevDateKey
            prevDateKey = dateKey

            if (item.kind === 'collapsed') {
              // Check if unread divider should appear before this group
              const groupStartIdx = filteredIdx
              const showUnread =
                unreadAfterIndex >= 0 &&
                unreadAfterIndex >= groupStartIdx &&
                unreadAfterIndex < groupStartIdx + item.entries.length
              filteredIdx += item.entries.length

              return (
                <React.Fragment key={`group-${item.entries[0].event.id}`}>
                  {showDateDivider && <DateDivider timestamp={itemTimestamp} />}
                  {showUnread && <UnreadDivider />}
                  <CollapsedSystemGroup group={item} />
                </React.Fragment>
              )
            }

            // Single entry
            const entryIdx = filteredIdx
            filteredIdx++
            const showUnread =
              unreadAfterIndex >= 0 && entryIdx === unreadAfterIndex + 1

            // For peek, entries already sliced; no unread logic needed
            const entryId = getEntryId(item.entry)

            // Grouped comments get tighter spacing
            const isGrouped = item.isGrouped

            return (
              <React.Fragment key={entryId}>
                {showDateDivider && <DateDivider timestamp={itemTimestamp} />}
                {showUnread && !isPeek && <UnreadDivider />}
                <div className={isGrouped ? '-mt-ds-04' : undefined}>
                  <TimelineEntryRenderer
                    entry={item.entry}
                    currentUserId={currentUserId}
                    onReact={onReact}
                    onEditComment={onEditComment}
                    onDeleteComment={onDeleteComment}
                    isGrouped={isGrouped}
                  />
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Agent streaming entry */}
        {isAgentStreaming && agentStreamingText && (
          <div className="flex gap-ds-03 px-ds-02 py-ds-02">
            <div className="shrink-0">
              <IconRobot className="h-ico-md w-ico-md text-accent-11" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-ds-02 text-ds-sm">
                <span className="font-semibold text-surface-fg">Sutradhar</span>
                <Badge variant="solid" color="accent" size="xs">AI</Badge>
              </div>
              <div className="mt-ds-01">
                <StreamingText
                  text={agentStreamingText}
                  className="text-ds-sm text-surface-fg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </div>

      {/* "N new" floating pill */}
      {userScrolledUp && newCount > 0 && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom()
            setUserScrolledUp(false)
            setNewCount(0)
          }}
          className="absolute bottom-ds-04 left-1/2 -translate-x-1/2 rounded-full bg-accent-9 px-ds-03 py-ds-01 text-ds-xs font-medium text-white shadow-md transition-colors hover:bg-accent-10"
        >
          &darr; {newCount} new
        </button>
      )}
    </div>
  )
}

TaskPanelTimeline.displayName = 'TaskPanelTimeline'
