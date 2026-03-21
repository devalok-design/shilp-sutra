'use client'

import * as React from 'react'
import {
  IconArrowsShuffle,
  IconUser,
  IconArrowUp,
  IconTag,
  IconCalendar,
  IconEye,
} from '@tabler/icons-react'
import type { SystemEvent } from '../task-panel-types'

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ACTION_ICONS: Record<SystemEvent['action'], React.ElementType> = {
  'status-change': IconArrowsShuffle,
  assignment: IconUser,
  priority: IconArrowUp,
  'label-add': IconTag,
  'label-remove': IconTag,
  'due-date': IconCalendar,
  visibility: IconEye,
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

export interface TimelineSystemEventProps {
  entry: Extract<
    import('../task-panel-types').TimelineEntry,
    { type: 'system-event' }
  >
}

// ---------------------------------------------------------------------------
// TimelineSystemEvent
// ---------------------------------------------------------------------------

export function TimelineSystemEvent({ entry }: TimelineSystemEventProps) {
  const { event } = entry
  const Icon = ACTION_ICONS[event.action]

  return (
    <div
      className="flex items-center gap-ds-02 text-[11px] text-surface-fg-subtle/70"
      data-testid="timeline-system-event"
    >
      <Icon className="h-3 w-3 shrink-0" data-testid={`icon-${event.action}`} />
      <span>
        <span className="font-medium text-surface-fg-subtle">{event.actorName}</span>
        {' '}
        {event.description}
      </span>
      <span className="ml-auto shrink-0">{formatTimestamp(event.timestamp)}</span>
    </div>
  )
}

TimelineSystemEvent.displayName = 'TimelineSystemEvent'
