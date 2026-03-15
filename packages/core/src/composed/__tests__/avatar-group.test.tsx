import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AvatarGroup } from '../avatar-group'

const mockUsers = [
  { name: 'Alice Johnson', image: null },
  { name: 'Bob Smith', image: null },
  { name: 'Charlie Brown', image: null },
  { name: 'Diana Prince', image: null },
  { name: 'Edward Norton', image: null },
  { name: 'Fiona Apple', image: null },
  { name: 'George Lucas', image: null },
  { name: 'Hannah Montana', image: null },
]

describe('AvatarGroup', () => {
  // ── Existing a11y tests ─────────────────────────────────────────────────

  it('should have no accessibility violations with multiple users', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 3)} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with overflow', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers} max={3} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations at small size', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 2)} size="sm" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations at large size', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 2)} size="lg" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with tooltips disabled', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 3)} showTooltip={false} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with a single user', async () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'Solo User' }]} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // ── Hover expand ────────────────────────────────────────────────────────

  describe('hover expand', () => {
    it('container has group class', () => {
      render(
        <AvatarGroup users={mockUsers.slice(0, 3)} showTooltip={false} />,
      )
      const container = screen.getByRole('group')
      expect(container.className).toContain('group')
    })

    it('has role="group" and aria-label', () => {
      render(
        <AvatarGroup users={mockUsers.slice(0, 3)} showTooltip={false} />,
      )
      const container = screen.getByRole('group')
      expect(container).toHaveAttribute('aria-label', '3 team members')
    })

    it('has no a11y violations', async () => {
      const { container } = render(
        <AvatarGroup users={mockUsers.slice(0, 5)} showTooltip={false} />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ── Border ──────────────────────────────────────────────────────────────

  describe('border', () => {
    it('renders border-surface-2 by default', () => {
      const { container } = render(
        <AvatarGroup users={mockUsers.slice(0, 2)} showTooltip={false} />,
      )
      // Check that the avatar elements have border-surface-2
      const avatars = container.querySelectorAll('[data-slot="avatar-fallback"]')
      expect(avatars.length).toBeGreaterThan(0)
      // The border class is on the Avatar wrapper, which is a parent
      const avatarWrapper = avatars[0].closest('span')!.parentElement!
      expect(avatarWrapper.className).toContain('border-surface-2')
    })

    it('renders border-surface-1 when borderColor="surface-1"', () => {
      const { container } = render(
        <AvatarGroup
          users={mockUsers.slice(0, 2)}
          borderColor="surface-1"
          showTooltip={false}
        />,
      )
      const avatars = container.querySelectorAll('[data-slot="avatar-fallback"]')
      expect(avatars.length).toBeGreaterThan(0)
      const avatarWrapper = avatars[0].closest('span')!.parentElement!
      expect(avatarWrapper.className).toContain('border-surface-1')
    })
  })

  // ── Size parity ─────────────────────────────────────────────────────────

  describe('size parity', () => {
    it('renders xs size', () => {
      const { container } = render(
        <AvatarGroup
          users={mockUsers.slice(0, 2)}
          size="xs"
          showTooltip={false}
        />,
      )
      // The CVA size classes land on the AvatarPrimitive.Root inside the Avatar wrapper span
      const xsAvatar = container.querySelector('.h-ds-xs')
      expect(xsAvatar).toBeInTheDocument()
      const xsAvatarW = container.querySelector('.w-ds-xs')
      expect(xsAvatarW).toBeInTheDocument()
    })

    it('renders xl size', () => {
      const { container } = render(
        <AvatarGroup
          users={mockUsers.slice(0, 2)}
          size="xl"
          showTooltip={false}
        />,
      )
      const xlAvatar = container.querySelector('.h-ds-lg')
      expect(xlAvatar).toBeInTheDocument()
      const xlAvatarW = container.querySelector('.w-ds-lg')
      expect(xlAvatarW).toBeInTheDocument()
    })
  })

  // ── Interactive overflow ────────────────────────────────────────────────

  describe('interactive overflow', () => {
    it('fires onOverflowClick when +N clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <AvatarGroup
          users={mockUsers}
          max={4}
          onOverflowClick={onClick}
          showTooltip={false}
        />,
      )
      const overflowBtn = screen.getByRole('button', { name: /\+4/ })
      await user.click(overflowBtn)
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('overflow badge has cursor-pointer when interactive', () => {
      render(
        <AvatarGroup
          users={mockUsers}
          max={4}
          onOverflowClick={() => {}}
          showTooltip={false}
        />,
      )
      const overflowBtn = screen.getByRole('button', { name: /\+4/ })
      expect(overflowBtn.className).toContain('cursor-pointer')
    })

    it('has no a11y violations with interactive overflow', async () => {
      const { container } = render(
        <AvatarGroup
          users={mockUsers}
          max={4}
          onOverflowClick={() => {}}
        />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ── Ring in group ───────────────────────────────────────────────────────

  describe('ring in group', () => {
    it('renders ring class when user has ring property', () => {
      const usersWithRings = [
        { name: 'Lead User', image: null, ring: 'lead' as const },
        { name: 'Admin User', image: null, ring: 'admin' as const },
      ]
      const { container } = render(
        <AvatarGroup users={usersWithRings} showTooltip={false} />,
      )
      // The ring is applied by the Avatar component as ring-accent-7, ring-warning-7 etc.
      // It renders on a span wrapper around the AvatarPrimitive.Root
      const ringElements = container.querySelectorAll('.ring-accent-7')
      expect(ringElements.length).toBeGreaterThanOrEqual(1)
      const adminRing = container.querySelectorAll('.ring-warning-7')
      expect(adminRing.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Render prop ─────────────────────────────────────────────────────────

  describe('render prop', () => {
    it('uses custom render function', () => {
      render(
        <AvatarGroup
          users={mockUsers.slice(0, 2)}
          showTooltip={false}
          renderAvatar={(user) => (
            <div data-testid="custom-avatar">{user.name}</div>
          )}
        />,
      )
      const customAvatars = screen.getAllByTestId('custom-avatar')
      expect(customAvatars).toHaveLength(2)
    })

    it('passes user and index to render function', () => {
      const renderFn = vi.fn((user, _index) => (
        <div data-testid="custom-avatar">{user.name}</div>
      ))
      render(
        <AvatarGroup
          users={mockUsers.slice(0, 3)}
          showTooltip={false}
          renderAvatar={renderFn}
        />,
      )
      expect(renderFn).toHaveBeenCalledTimes(3)
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice Johnson' }),
        0,
      )
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bob Smith' }),
        1,
      )
      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Charlie Brown' }),
        2,
      )
    })
  })
})
