'use client'

import * as React from 'react'
import { IconRobot } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { StreamingText } from '../../chat/streaming-text'
import { TaskTimeline } from '../../composed/task-timeline'
import { useTaskPanel } from './task-panel-context'

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
    clientMode,
    mode,
    onReact,
    onEditComment,
    onDeleteComment,
    typingUsers,
    isAgentStreaming,
    agentStreamingText,
  } = useTaskPanel()

  const [filter, setFilter] = React.useState<'all' | 'comments' | 'activity' | 'reviews'>('all')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [userScrolledUp, setUserScrolledUp] = React.useState(false)
  const [newCount, setNewCount] = React.useState(0)

  const isPeek = mode === 'peek'

  // ---- Track entry count for "new" counter ----
  const prevLengthRef = React.useRef(timeline.length)

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

  // ---- Peek mode entries ----
  const entries = isPeek ? timeline.slice(-2) : timeline

  // ---- Wrap edit/delete callbacks to match TaskTimeline's (id-only) signatures ----
  // TaskTimeline's onEdit fires with just an id; the panel context expects
  // (commentId, newContent). We pass the id — consumer code will need to
  // open an edit modal or inline editor to collect the new content.
  const handleEdit = React.useCallback(
    (entryId: string) => {
      // Signal edit intent — consumer should prompt for new content
      onEditComment(entryId, '')
    },
    [onEditComment],
  )

  const handleDelete = React.useCallback(
    (entryId: string) => {
      onDeleteComment(entryId)
    },
    [onDeleteComment],
  )

  // ---- Render ----
  return (
    <div className={cn('flex flex-1 flex-col overflow-hidden', className)} {...props}>
      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-ds-06 py-ds-04"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-surface-border) transparent' }}
      >
        {/* Fade-in gradient at top of scroll area */}
        {!clientMode && !isPeek && (
          <div className="pointer-events-none sticky top-0 left-0 right-0 z-10 h-3 -mb-3 bg-gradient-to-b from-surface-raised to-transparent" />
        )}

        <TaskTimeline
          entries={entries}
          filter={isPeek ? undefined : filter}
          onFilterChange={isPeek || clientMode ? undefined : setFilter}
          clientMode={clientMode}
          onReact={onReact}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Agent streaming entry */}
        {isAgentStreaming && agentStreamingText && (
          <div className="flex gap-ds-03 px-ds-02 py-ds-02">
            <div className="shrink-0">
              <Icon icon={IconRobot} size="md" className="text-accent-11" />
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
        <Button
          variant="solid"
          size="xs"
          shape="pill"
          onClick={() => {
            scrollToBottom()
            setUserScrolledUp(false)
            setNewCount(0)
          }}
          className="absolute bottom-ds-04 left-1/2 -translate-x-1/2 shadow-md"
        >
          &darr; {newCount} new
        </Button>
      )}
    </div>
  )
}

TaskPanelTimeline.displayName = 'TaskPanelTimeline'
