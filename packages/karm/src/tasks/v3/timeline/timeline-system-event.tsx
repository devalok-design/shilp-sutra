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
import { Icon } from '@/ui/icon'
import { SystemMessage } from '@/ui/chat'
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
  const EventIcon = ACTION_ICONS[event.action]

  return (
    <SystemMessage
      icon={<Icon icon={EventIcon as any} size="xs" className="shrink-0" />}
      timestamp={event.timestamp}
      data-testid="timeline-system-event"
    >
      <span className="font-medium">{event.actorName}</span>
      {' '}
      {event.description}
    </SystemMessage>
  )
}

TimelineSystemEvent.displayName = 'TimelineSystemEvent'
