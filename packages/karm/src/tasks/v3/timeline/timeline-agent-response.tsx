'use client'

import * as React from 'react'
import { IconRobot } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Message } from '@/ui/chat'
import { Badge } from '@/ui/badge'
import { MotionCollapse } from '@/motion/primitives'
import { StreamingText } from '../../../chat/streaming-text'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Rough threshold for "long" content (> ~10 lines) */
const COLLAPSE_CHAR_THRESHOLD = 500
const PREVIEW_CHAR_LIMIT = 200

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

export interface TimelineAgentResponseProps {
  entry: Extract<
    import('../task-panel-types').TimelineEntry,
    { type: 'agent-response' }
  >
}

// ---------------------------------------------------------------------------
// TimelineAgentResponse
// ---------------------------------------------------------------------------

export function TimelineAgentResponse({ entry }: TimelineAgentResponseProps) {
  const { response } = entry
  const isLong = response.content.length > COLLAPSE_CHAR_THRESHOLD
  const [expanded, setExpanded] = React.useState(false)

  const aiBadge = (
    <Badge variant="solid" color="accent" size="xs" data-testid="ai-badge">
      AI
    </Badge>
  )

  return (
    <Message
      className="bg-accent-2/30 rounded-ds-md p-ds-03 -mx-ds-03"
      data-testid="timeline-agent-response"
    >
      <Message.Avatar
        icon={
          response.agentIcon ?? (
            <Icon icon={IconRobot} size="md" className="text-accent-11" />
          )
        }
        size="md"
      />
      <Message.Content>
        <Message.Author
          name={response.agentName}
          badge={aiBadge}
          formattedTimestamp={formatTimestamp(response.timestamp)}
        />
        <Message.Body>
          {response.isStreaming ? (
            <StreamingText
              text={response.content}
              className="text-ds-sm text-surface-fg"
              data-testid="streaming-content"
            />
          ) : isLong && !expanded ? (
            <div>
              <p className="text-ds-sm text-surface-fg" data-testid="collapsed-content">
                {response.content.slice(0, PREVIEW_CHAR_LIMIT)}...
              </p>
              {response.summary && (
                <p className="mt-ds-01 text-ds-xs text-surface-fg-muted italic">
                  {response.summary}
                </p>
              )}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-ds-02 text-ds-xs font-medium text-accent-11 hover:text-accent-12 transition-colors"
                data-testid="expand-button"
              >
                Show full response
              </button>
            </div>
          ) : (
            <MotionCollapse show={true}>
              <p className="text-ds-sm text-surface-fg" data-testid="full-content">
                {response.content}
              </p>
            </MotionCollapse>
          )}
        </Message.Body>
      </Message.Content>
    </Message>
  )
}

TimelineAgentResponse.displayName = 'TimelineAgentResponse'
