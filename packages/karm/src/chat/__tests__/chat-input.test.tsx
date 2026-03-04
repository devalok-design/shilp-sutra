import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ChatInput } from '../chat-input'

describe('ChatInput', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ChatInput onSubmit={vi.fn()} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders textarea with default placeholder', () => {
    render(<ChatInput onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Ask Karm AI...')).toBeInTheDocument()
  })

  it('renders custom placeholder', () => {
    render(<ChatInput onSubmit={vi.fn()} placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('renders send button with accessible label', () => {
    render(<ChatInput onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('renders stop button when streaming', () => {
    render(<ChatInput onSubmit={vi.fn()} isStreaming onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Stop generating')).toBeInTheDocument()
  })

  it('renders disclaimer text', () => {
    render(<ChatInput onSubmit={vi.fn()} />)
    expect(screen.getByText(/AI responses may be inaccurate/)).toBeInTheDocument()
  })

  it('renders custom disclaimer', () => {
    render(<ChatInput onSubmit={vi.fn()} disclaimer="Custom disclaimer" />)
    expect(screen.getByText('Custom disclaimer')).toBeInTheDocument()
  })
})
