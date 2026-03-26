'use client'

import * as React from 'react'
import { IconCheck, IconArrowBackUp, IconClock } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Message } from '@/ui/chat'
import type { ReviewEvent } from '../task-panel-types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<
  ReviewEvent['action'],
  { icon: React.ElementType; className: string; label: string }
> = {
  approved: {
    icon: IconCheck,
    className: 'text-success-11',
    label: 'approved',
  },
  'changes-requested': {
    icon: IconArrowBackUp,
    className: 'text-warning-11',
    label: 'requested changes',
  },
  submitted: {
    icon: IconClock,
    className: 'text-surface-fg-muted',
    label: 'submitted for review',
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TimelineReviewEventProps {
  entry: Extract<
    import('../task-panel-types').TimelineEntry,
    { type: 'review-event' }
  >
}

// ---------------------------------------------------------------------------
// TimelineReviewEvent
// ---------------------------------------------------------------------------

export function TimelineReviewEvent({ entry }: TimelineReviewEventProps) {
  const { event } = entry
  const config = ACTION_CONFIG[event.action]
  const ReviewIcon = config.icon

  return (
    <Message data-testid="timeline-review-event">
      <Message.Avatar
        icon={
          <Icon
            icon={ReviewIcon as any}
            size="sm"
            className={cn('shrink-0', config.className)}
          />
        }
        size="sm"
      />
      <Message.Content>
        <Message.Author
          name={event.reviewerName}
          formattedTimestamp={formatTimestamp(event.timestamp)}
          badge={
            <span className="text-surface-fg-muted text-[13px] font-normal">
              {config.label}
            </span>
          }
        />
        {event.comment && (
          <Message.Body className="text-surface-fg-muted">
            {event.comment}
          </Message.Body>
        )}
      </Message.Content>
    </Message>
  )
}

TimelineReviewEvent.displayName = 'TimelineReviewEvent'
