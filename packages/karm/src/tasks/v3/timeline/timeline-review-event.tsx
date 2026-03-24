'use client'

import * as React from 'react'
import { IconCheck, IconArrowBackUp, IconClock } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
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
    <div className="flex flex-col gap-ds-01" data-testid="timeline-review-event">
      <div className="flex items-center gap-ds-02 text-ds-sm">
        <Icon
          icon={ReviewIcon as any}
          size="sm"
          className={cn('shrink-0', config.className)}
        />
        <span className="text-surface-fg-muted">
          <span className="font-semibold text-surface-fg">
            {event.reviewerName}
          </span>
          {' '}
          {config.label}
        </span>
        <span className="ml-auto shrink-0 text-ds-xs text-surface-fg-subtle">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      {event.comment && (
        <p className="ml-ds-06 text-ds-sm text-surface-fg-muted">
          {event.comment}
        </p>
      )}
    </div>
  )
}

TimelineReviewEvent.displayName = 'TimelineReviewEvent'
