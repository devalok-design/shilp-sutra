import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../hover-card'

describe('HoverCard accessibility', () => {
  it('should have no violations in closed state', async () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="https://example.com">Hover over me</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>Additional details about this link.</p>
        </HoverCardContent>
      </HoverCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in open state', async () => {
    const { container } = render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="https://example.com">Hover over me</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>Additional details about this link.</p>
        </HoverCardContent>
      </HoverCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
