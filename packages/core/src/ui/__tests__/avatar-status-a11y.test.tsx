import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'
import type { AvatarStatus } from '../avatar'

describe('Avatar status indicator accessibility', () => {
  const statuses: AvatarStatus[] = ['online', 'offline', 'busy', 'away']

  it.each(statuses)(
    'should have no a11y violations with status="%s"',
    async (status) => {
      const { container } = render(
        <Avatar status={status}>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )

  it('should have no a11y violations without status (default)', async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should render aria-label on the status dot', () => {
    const { container } = render(
      <Avatar status="online">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const dot = container.querySelector('[role="img"]')
    expect(dot).not.toBeNull()
    expect(dot?.getAttribute('aria-label')).toBe('Online')
  })

  it('should not render a status dot when status is undefined', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const dot = container.querySelector('[role="img"]')
    expect(dot).toBeNull()
  })

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'should have no a11y violations at size="%s" with status',
    async (size) => {
      const { container } = render(
        <Avatar size={size} status="online">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )
})
