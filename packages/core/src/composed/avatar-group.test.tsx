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
})
