import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { TimelineEntry, Comment, SystemEvent, ReviewEvent, AgentResponse } from '../task-panel-types'
import { TimelineComment } from '../timeline/timeline-comment'
import { TimelineSystemEvent } from '../timeline/timeline-system-event'
import { TimelineReviewEvent } from '../timeline/timeline-review-event'
import { TimelineAgentResponse } from '../timeline/timeline-agent-response'
import { TimelineEntryRenderer } from '../timeline/timeline-entry'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock StreamingText to avoid markdown rendering deps
vi.mock('../../../chat/streaming-text', () => ({
  StreamingText: ({ text, ...props }: any) => (
    <div data-testid="streaming-content" {...props}>{text}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'comment-1',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: 'This looks great!',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    internalAuthor: {
      id: 'user-1',
      name: 'Mudit Gupta',
      email: 'mudit@example.com',
      image: null,
    },
    ...overrides,
  }
}

function makeCommentEntry(
  commentOverrides: Partial<Comment> = {},
  reactions?: TimelineEntry extends { type: 'comment'; reactions?: infer R } ? R : never,
): Extract<TimelineEntry, { type: 'comment' }> {
  return {
    type: 'comment',
    comment: makeComment(commentOverrides),
    reactions,
  }
}

function makeSystemEvent(
  overrides: Partial<SystemEvent> = {},
): Extract<TimelineEntry, { type: 'system-event' }> {
  return {
    type: 'system-event',
    event: {
      id: 'event-1',
      actorId: 'user-1',
      actorName: 'Mudit Gupta',
      action: 'status-change',
      description: 'changed status to In Progress',
      timestamp: '2026-03-20T10:00:00Z',
      ...overrides,
    },
  }
}

function makeReviewEvent(
  overrides: Partial<ReviewEvent> = {},
): Extract<TimelineEntry, { type: 'review-event' }> {
  return {
    type: 'review-event',
    event: {
      id: 'review-1',
      reviewerId: 'user-2',
      reviewerName: 'Amal Roy',
      action: 'approved',
      timestamp: '2026-03-20T10:00:00Z',
      ...overrides,
    },
  }
}

function makeAgentEntry(
  overrides: Partial<AgentResponse> = {},
): Extract<TimelineEntry, { type: 'agent-response' }> {
  return {
    type: 'agent-response',
    response: {
      id: 'agent-1',
      agentId: 'devadoot',
      agentName: 'Devadoot',
      content: 'I analyzed the task and here are my findings.',
      timestamp: '2026-03-20T10:00:00Z',
      ...overrides,
    },
  }
}

// ---------------------------------------------------------------------------
// TimelineComment tests
// ---------------------------------------------------------------------------

describe('TimelineComment', () => {
  const noop = () => {}

  it('renders avatar, name, badge, and content', () => {
    render(
      <TimelineComment
        entry={makeCommentEntry()}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('comment-author')).toHaveTextContent('Mudit Gupta')
    // Internal comments don't show a badge — only CLIENT comments get a "Client" badge
    expect(screen.queryByTestId('comment-badge')).not.toBeInTheDocument()
    expect(screen.getByTestId('comment-content')).toHaveTextContent('This looks great!')
    // Avatar fallback should show initials
    expect(screen.getByText('MG')).toBeInTheDocument()
  })

  it('renders Client badge for client comments', () => {
    render(
      <TimelineComment
        entry={makeCommentEntry({
          authorType: 'CLIENT',
          clientAuthor: { id: 'client-1', name: 'Jane Client', email: 'jane@client.com' },
        })}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('comment-badge')).toHaveTextContent('Client')
    expect(screen.getByTestId('comment-author')).toHaveTextContent('Jane Client')
  })

  it('renders reactions when present', () => {
    render(
      <TimelineComment
        entry={makeCommentEntry({}, [
          { emoji: '👍', count: 3, reacted: false },
          { emoji: '🎉', count: 1, reacted: true },
        ])}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('reactions-row')).toBeInTheDocument()
    const buttons = screen.getAllByTestId('reaction-button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('👍')
    expect(buttons[0]).toHaveTextContent('3')
    expect(buttons[1]).toHaveTextContent('🎉')
    expect(buttons[1]).toHaveTextContent('1')
  })

  it('applies accent border when current user is @mentioned', () => {
    render(
      <TimelineComment
        entry={makeCommentEntry({ content: 'Hey @user-1 check this out' })}
        currentUserId="user-1"
        onReact={noop}
      />,
    )
    const comment = screen.getByTestId('timeline-comment')
    expect(comment.className).toContain('border-l-accent-9')
    expect(comment.className).toContain('bg-accent-2')
  })

  it('does not apply mention highlight when user not mentioned', () => {
    render(
      <TimelineComment
        entry={makeCommentEntry({ content: 'Hey @someone-else check this out' })}
        currentUserId="user-1"
        onReact={noop}
      />,
    )
    const comment = screen.getByTestId('timeline-comment')
    expect(comment.className).not.toContain('border-l-accent-9')
  })

  it('calls onReact when a reaction button is clicked', () => {
    const onReact = vi.fn()
    render(
      <TimelineComment
        entry={makeCommentEntry({}, [
          { emoji: '👍', count: 1, reacted: false },
        ])}
        currentUserId={null}
        onReact={onReact}
      />,
    )
    fireEvent.click(screen.getByTestId('reaction-button'))
    expect(onReact).toHaveBeenCalledWith('comment-1', '👍')
  })
})

// ---------------------------------------------------------------------------
// TimelineSystemEvent tests
// ---------------------------------------------------------------------------

describe('TimelineSystemEvent', () => {
  it('renders correct icon and description for status-change', () => {
    render(<TimelineSystemEvent entry={makeSystemEvent()} />)
    const el = screen.getByTestId('timeline-system-event')
    expect(el).toHaveTextContent('Mudit Gupta')
    expect(el).toHaveTextContent('changed status to In Progress')
    expect(screen.getByTestId('icon-status-change')).toBeInTheDocument()
  })

  it('renders assignment icon', () => {
    render(
      <TimelineSystemEvent
        entry={makeSystemEvent({ action: 'assignment', description: 'assigned to Amal' })}
      />,
    )
    expect(screen.getByTestId('icon-assignment')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-system-event')).toHaveTextContent('assigned to Amal')
  })

  it('renders priority icon', () => {
    render(
      <TimelineSystemEvent
        entry={makeSystemEvent({ action: 'priority', description: 'set priority to High' })}
      />,
    )
    expect(screen.getByTestId('icon-priority')).toBeInTheDocument()
  })

  it('renders label-add icon', () => {
    render(
      <TimelineSystemEvent
        entry={makeSystemEvent({ action: 'label-add', description: 'added label "Bug"' })}
      />,
    )
    expect(screen.getByTestId('icon-label-add')).toBeInTheDocument()
  })

  it('renders due-date icon', () => {
    render(
      <TimelineSystemEvent
        entry={makeSystemEvent({ action: 'due-date', description: 'set due date to Mar 25' })}
      />,
    )
    expect(screen.getByTestId('icon-due-date')).toBeInTheDocument()
  })

  it('renders visibility icon', () => {
    render(
      <TimelineSystemEvent
        entry={makeSystemEvent({ action: 'visibility', description: 'changed to Everyone' })}
      />,
    )
    expect(screen.getByTestId('icon-visibility')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TimelineReviewEvent tests
// ---------------------------------------------------------------------------

describe('TimelineReviewEvent', () => {
  it('renders approved variant', () => {
    render(<TimelineReviewEvent entry={makeReviewEvent({ action: 'approved' })} />)
    const el = screen.getByTestId('timeline-review-event')
    expect(el).toHaveTextContent('Amal Roy')
    expect(el).toHaveTextContent('approved')
    expect(screen.getByTestId('review-icon-approved')).toBeInTheDocument()
  })

  it('renders changes-requested variant', () => {
    render(
      <TimelineReviewEvent
        entry={makeReviewEvent({ action: 'changes-requested' })}
      />,
    )
    expect(screen.getByTestId('timeline-review-event')).toHaveTextContent('requested changes')
    expect(screen.getByTestId('review-icon-changes-requested')).toBeInTheDocument()
  })

  it('renders submitted variant', () => {
    render(
      <TimelineReviewEvent
        entry={makeReviewEvent({ action: 'submitted' })}
      />,
    )
    expect(screen.getByTestId('timeline-review-event')).toHaveTextContent('submitted for review')
    expect(screen.getByTestId('review-icon-submitted')).toBeInTheDocument()
  })

  it('renders optional comment text', () => {
    render(
      <TimelineReviewEvent
        entry={makeReviewEvent({ comment: 'Please fix the alignment' })}
      />,
    )
    expect(screen.getByTestId('timeline-review-event')).toHaveTextContent(
      'Please fix the alignment',
    )
  })
})

// ---------------------------------------------------------------------------
// TimelineAgentResponse tests
// ---------------------------------------------------------------------------

describe('TimelineAgentResponse', () => {
  it('renders agent name and AI badge', () => {
    render(<TimelineAgentResponse entry={makeAgentEntry()} />)
    const el = screen.getByTestId('timeline-agent-response')
    expect(el).toHaveTextContent('Devadoot')
    expect(screen.getByTestId('ai-badge')).toHaveTextContent('AI')
  })

  it('renders streaming content when isStreaming', () => {
    render(
      <TimelineAgentResponse
        entry={makeAgentEntry({ isStreaming: true, content: 'Analyzing...' })}
      />,
    )
    expect(screen.getByTestId('streaming-content')).toHaveTextContent('Analyzing...')
  })

  it('collapses long content and shows expand button', () => {
    const longContent = 'A'.repeat(600)
    render(<TimelineAgentResponse entry={makeAgentEntry({ content: longContent })} />)
    expect(screen.getByTestId('collapsed-content')).toBeInTheDocument()
    expect(screen.getByTestId('expand-button')).toHaveTextContent('Show full response')
  })

  it('expands collapsed content when button is clicked', () => {
    const longContent = 'A'.repeat(600)
    render(<TimelineAgentResponse entry={makeAgentEntry({ content: longContent })} />)
    fireEvent.click(screen.getByTestId('expand-button'))
    expect(screen.getByTestId('full-content')).toHaveTextContent(longContent)
    expect(screen.queryByTestId('expand-button')).not.toBeInTheDocument()
  })

  it('shows summary when content is collapsed and summary exists', () => {
    const longContent = 'A'.repeat(600)
    render(
      <TimelineAgentResponse
        entry={makeAgentEntry({ content: longContent, summary: 'TL;DR: all good' })}
      />,
    )
    expect(screen.getByTestId('timeline-agent-response')).toHaveTextContent('TL;DR: all good')
  })
})

// ---------------------------------------------------------------------------
// TimelineEntryRenderer tests
// ---------------------------------------------------------------------------

describe('TimelineEntryRenderer', () => {
  const noop = () => {}

  it('dispatches comment entry to TimelineComment', () => {
    render(
      <TimelineEntryRenderer
        entry={makeCommentEntry()}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('timeline-comment')).toBeInTheDocument()
  })

  it('dispatches system-event entry to TimelineSystemEvent', () => {
    render(
      <TimelineEntryRenderer
        entry={makeSystemEvent()}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('timeline-system-event')).toBeInTheDocument()
  })

  it('dispatches review-event entry to TimelineReviewEvent', () => {
    render(
      <TimelineEntryRenderer
        entry={makeReviewEvent()}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('timeline-review-event')).toBeInTheDocument()
  })

  it('dispatches agent-response entry to TimelineAgentResponse', () => {
    render(
      <TimelineEntryRenderer
        entry={makeAgentEntry()}
        currentUserId={null}
        onReact={noop}
      />,
    )
    expect(screen.getByTestId('timeline-agent-response')).toBeInTheDocument()
  })
})
