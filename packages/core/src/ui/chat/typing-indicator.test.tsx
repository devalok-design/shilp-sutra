import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { TypingIndicator } from './typing-indicator'

describe('TypingIndicator', () => {
  it('1 user: "Sarah is typing..."', () => {
    render(<TypingIndicator users={[{ name: 'Sarah' }]} />)
    expect(screen.getByText('Sarah is typing...')).toBeInTheDocument()
  })

  it('2 users: "Sarah and Arjun are typing..."', () => {
    render(
      <TypingIndicator
        users={[{ name: 'Sarah' }, { name: 'Arjun' }]}
      />,
    )
    expect(
      screen.getByText('Sarah and Arjun are typing...'),
    ).toBeInTheDocument()
  })

  it('3+ users: "Several people are typing..."', () => {
    render(
      <TypingIndicator
        users={[
          { name: 'Sarah' },
          { name: 'Arjun' },
          { name: 'Maya' },
        ]}
      />,
    )
    expect(
      screen.getByText('Several people are typing...'),
    ).toBeInTheDocument()
  })

  it('0 users: no visible text, container still renders', () => {
    const { container } = render(<TypingIndicator users={[]} />)
    // Container should exist with min-h-ds-06 (24px)
    const root = container.firstChild as HTMLElement
    expect(root).toBeInTheDocument()
    expect(root).toHaveClass('min-h-ds-06')
    // No typing text visible
    expect(screen.queryByText(/typing/)).not.toBeInTheDocument()
  })

  it('renders animated dots', () => {
    const { container } = render(
      <TypingIndicator users={[{ name: 'Sarah' }]} />,
    )
    const dots = container.querySelectorAll('.rounded-pill.bg-surface-fg-subtle')
    expect(dots.length).toBe(3)
  })
})
