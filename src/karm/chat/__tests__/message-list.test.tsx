import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MessageList } from '../message-list'
import type { ChatMessage } from '../message-list'

const sampleMessages: ChatMessage[] = [
  { id: 'msg-1', role: 'USER', content: 'Hello, how are you?' },
  { id: 'msg-2', role: 'ASSISTANT', content: 'I am doing well, thanks!' },
  { id: 'msg-3', role: 'SYSTEM', content: 'Connection error occurred.' },
]

describe('MessageList', () => {
  it('has no a11y violations with messages', async () => {
    const { container } = render(
      <MessageList messages={sampleMessages} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders user messages', () => {
    render(<MessageList messages={sampleMessages} />)
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
  })

  it('renders assistant messages', () => {
    render(<MessageList messages={sampleMessages} />)
    expect(screen.getByText('I am doing well, thanks!')).toBeInTheDocument()
  })

  it('renders system error messages', () => {
    render(<MessageList messages={sampleMessages} />)
    expect(screen.getByText('Connection error occurred.')).toBeInTheDocument()
  })

  it('renders empty state when no messages', () => {
    render(<MessageList messages={[]} />)
    expect(screen.getByText('Karm AI')).toBeInTheDocument()
    expect(screen.getByText(/Ask me about tasks/)).toBeInTheDocument()
  })

  it('renders custom empty title and description', () => {
    render(
      <MessageList
        messages={[]}
        emptyTitle="Support Bot"
        emptyDescription="How can I help?"
      />,
    )
    expect(screen.getByText('Support Bot')).toBeInTheDocument()
    expect(screen.getByText('How can I help?')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<MessageList messages={[]} isLoadingMessages />)
    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('renders chat messages with log role', () => {
    const { container } = render(
      <MessageList messages={sampleMessages} />,
    )
    expect(container.querySelector('[role="log"]')).toBeInTheDocument()
  })
})
