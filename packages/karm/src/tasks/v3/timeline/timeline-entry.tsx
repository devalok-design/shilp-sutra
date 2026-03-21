'use client'

import * as React from 'react'
import type { TimelineEntry } from '../task-panel-types'
import { TimelineComment } from './timeline-comment'
import { TimelineSystemEvent } from './timeline-system-event'
import { TimelineReviewEvent } from './timeline-review-event'
import { TimelineAgentResponse } from './timeline-agent-response'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TimelineEntryRendererProps {
  entry: TimelineEntry
  currentUserId: string | null
  onReact: (entryId: string, emoji: string) => void
  /** Whether this comment is a grouped continuation (same author, <5min). */
  isGrouped?: boolean
}

// ---------------------------------------------------------------------------
// TimelineEntryRenderer
// ---------------------------------------------------------------------------

export function TimelineEntryRenderer({
  entry,
  currentUserId,
  onReact,
  isGrouped,
}: TimelineEntryRendererProps) {
  switch (entry.type) {
    case 'comment':
      return (
        <TimelineComment
          entry={entry}
          currentUserId={currentUserId}
          onReact={onReact}
          isGrouped={isGrouped}
        />
      )
    case 'system-event':
      return <TimelineSystemEvent entry={entry} />
    case 'review-event':
      return <TimelineReviewEvent entry={entry} />
    case 'agent-response':
      return <TimelineAgentResponse entry={entry} />
    default:
      return null
  }
}

TimelineEntryRenderer.displayName = 'TimelineEntryRenderer'
