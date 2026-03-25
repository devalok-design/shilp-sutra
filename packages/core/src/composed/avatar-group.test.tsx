import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AvatarGroup, type AvatarUser } from './avatar-group'

const users: AvatarUser[] = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
  { name: 'Diana' },
  { name: 'Eve' },
]

describe('AvatarGroup', () => {
  it('renders a group with correct aria label', () => {
    render(<AvatarGroup users={users} />)
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      '5 team members',
    )
  })

  it('displays overflow count when users exceed max', () => {
    render(<AvatarGroup users={users} max={3} />)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('does not show overflow when users fit within max', () => {
    render(<AvatarGroup users={users.slice(0, 2)} max={4} />)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('renders initials in fallback', () => {
    render(<AvatarGroup users={[{ name: 'Alice' }]} max={4} showTooltip={false} />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('calls onOverflowClick when overflow badge is clicked', async () => {
    const onClick = vi.fn()
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(<AvatarGroup users={users} max={3} onOverflowClick={onClick} />)
    await user.click(screen.getByText('+2'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses renderAvatar when provided', () => {
    render(
      <AvatarGroup
        users={[{ name: 'Custom' }]}
        max={4}
        showTooltip={false}
        renderAvatar={(user) => <div data-testid="custom">{user.name}</div>}
      />,
    )
    expect(screen.getByTestId('custom')).toHaveTextContent('Custom')
  })

  // ── Indicator ───────────────────────────────────────────────────────────

  describe('indicator', () => {
    it('renders lead indicator with bg-warning-9', () => {
      const { container } = render(
        <AvatarGroup
          users={[{ name: 'Alice', indicator: 'lead' }]}
          max={4}
          showTooltip={false}
        />,
      )
      const dot = container.querySelector('.bg-warning-9')
      expect(dot).toBeInTheDocument()
      expect(dot!.tagName).toBe('SPAN')
    })

    it('renders admin indicator with bg-accent-9', () => {
      const { container } = render(
        <AvatarGroup
          users={[{ name: 'Bob', indicator: 'admin' }]}
          max={4}
          showTooltip={false}
        />,
      )
      const dot = container.querySelector('.bg-accent-9')
      expect(dot).toBeInTheDocument()
      expect(dot!.tagName).toBe('SPAN')
    })

    it('renders custom ReactNode indicator', () => {
      render(
        <AvatarGroup
          users={[{ name: 'Charlie', indicator: <span data-testid="custom-indicator">★</span> }]}
          max={4}
          showTooltip={false}
        />,
      )
      expect(screen.getByTestId('custom-indicator')).toHaveTextContent('★')
    })

    it('does not render indicator span when undefined', () => {
      const { container } = render(
        <AvatarGroup
          users={[{ name: 'Diana' }]}
          max={4}
          showTooltip={false}
        />,
      )
      const dots = container.querySelectorAll('.ring-surface-raised')
      // The indicator span has ring-1 ring-surface-raised; no such element should exist
      // when indicator is undefined
      const indicatorSpans = Array.from(dots).filter(
        (el) => el.tagName === 'SPAN' && el.classList.contains('rounded-full') && el.classList.contains('h-2'),
      )
      expect(indicatorSpans).toHaveLength(0)
    })

    it('does not render indicator in renderAvatar path', () => {
      const { container } = render(
        <AvatarGroup
          users={[{ name: 'Eve', indicator: 'lead' }]}
          max={4}
          showTooltip={false}
          renderAvatar={(user) => <div data-testid="custom">{user.name}</div>}
        />,
      )
      expect(container.querySelector('.bg-warning-9')).not.toBeInTheDocument()
    })
  })
})
