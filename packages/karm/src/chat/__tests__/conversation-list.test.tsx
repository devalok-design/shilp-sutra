import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ConversationList } from '../conversation-list'
import type { Conversation } from '../conversation-list'

const conversations: Conversation[] = [
  { id: 'conv-1', title: 'Project discussion', updatedAt: new Date().toISOString() },
  { id: 'conv-2', title: 'Bug report', updatedAt: new Date().toISOString() },
  { id: 'conv-3', title: null, updatedAt: new Date().toISOString() },
]

describe('ConversationList', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders conversation titles', () => {
    render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByText('Project discussion')).toBeInTheDocument()
    expect(screen.getByText('Bug report')).toBeInTheDocument()
  })

  it('renders fallback for null title', () => {
    render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByText('Untitled conversation')).toBeInTheDocument()
  })

  it('renders Conversations heading', () => {
    render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByText('Conversations')).toBeInTheDocument()
  })

  it('renders New Chat button', () => {
    render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('renders empty state when no conversations', () => {
    render(
      <ConversationList
        conversations={[]}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    )
    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
  })

  it('renders archive and delete buttons when handlers provided', () => {
    render(
      <ConversationList
        conversations={conversations}
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    const archiveButtons = screen.getAllByLabelText('Archive conversation')
    const deleteButtons = screen.getAllByLabelText('Delete conversation')
    expect(archiveButtons.length).toBe(conversations.length)
    expect(deleteButtons.length).toBe(conversations.length)
  })
})
