import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { BadgeIndicator } from '../badge-indicator'

describe('BadgeIndicator', () => {
  it('renders children', () => {
    render(
      <BadgeIndicator>
        <span>icon</span>
      </BadgeIndicator>,
    )
    expect(screen.getByText('icon')).toBeInTheDocument()
  })

  it('shows count', () => {
    render(
      <BadgeIndicator count={5}>
        <span />
      </BadgeIndicator>,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('clamps count above max to "{max}+"', () => {
    render(
      <BadgeIndicator count={150} max={99}>
        <span />
      </BadgeIndicator>,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('uses default max of 99 when max is not provided', () => {
    render(
      <BadgeIndicator count={120}>
        <span />
      </BadgeIndicator>,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not render indicator when count is 0 and showZero is false', () => {
    const { container } = render(
      <BadgeIndicator count={0}>
        <span />
      </BadgeIndicator>,
    )
    expect(container.querySelector('.absolute')).not.toBeInTheDocument()
  })

  it('shows "0" when showZero is true', () => {
    render(
      <BadgeIndicator count={0} showZero>
        <span />
      </BadgeIndicator>,
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders dot with no count text', () => {
    render(
      <BadgeIndicator dot>
        <span />
      </BadgeIndicator>,
    )
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument()
  })

  it('invisible prop hides the indicator even with a count', () => {
    const { container } = render(
      <BadgeIndicator count={5} invisible>
        <span />
      </BadgeIndicator>,
    )
    expect(container.querySelector('.absolute')).not.toBeInTheDocument()
  })

  it('does not render indicator when count is undefined and dot is false', () => {
    const { container } = render(
      <BadgeIndicator>
        <span />
      </BadgeIndicator>,
    )
    expect(container.querySelector('.absolute')).not.toBeInTheDocument()
  })

  it('applies placement classes', () => {
    const { container } = render(
      <BadgeIndicator count={1} placement="bottom-left">
        <span />
      </BadgeIndicator>,
    )
    expect(container.querySelector('.absolute')).toHaveClass('-bottom-1', '-left-1')
  })

  it('passes axe audit when visible', async () => {
    const { container } = render(
      <BadgeIndicator count={3}>
        <span>icon</span>
      </BadgeIndicator>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
