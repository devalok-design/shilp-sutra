import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Badge } from '../badge'
import { BadgeGroup } from '../badge-group'

describe('BadgeGroup', () => {
  it('renders all children when under max', () => {
    render(
      <BadgeGroup>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('truncates to max and shows +N overflow badge', () => {
    render(
      <BadgeGroup max={2}>
        <Badge>A</Badge>
        <Badge>B</Badge>
        <Badge>C</Badge>
      </BadgeGroup>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('C')).not.toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('does not render overflow badge when exactly at max', () => {
    render(
      <BadgeGroup max={2}>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('does not render overflow badge when max is undefined', () => {
    render(
      <BadgeGroup>
        <Badge>A</Badge>
        <Badge>B</Badge>
        <Badge>C</Badge>
      </BadgeGroup>,
    )
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('overflow badge has aria-label when onOverflowClick is provided', () => {
    const fn = vi.fn()
    render(
      <BadgeGroup max={1} onOverflowClick={fn}>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    expect(screen.getByLabelText('Show 1 more')).toBeInTheDocument()
  })

  it('calls onOverflowClick when overflow badge is clicked', async () => {
    const user = userEvent.setup()
    const fn = vi.fn()
    render(
      <BadgeGroup max={1} onOverflowClick={fn}>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    await user.click(screen.getByText('+1'))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('overflow badge has no aria-label when onOverflowClick is absent', () => {
    render(
      <BadgeGroup max={1}>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    const overflow = screen.getByText('+1')
    expect(overflow).not.toHaveAttribute('aria-label')
  })

  it('passes axe audit with overflow and click handler', async () => {
    const { container } = render(
      <BadgeGroup max={1} onOverflowClick={vi.fn()}>
        <Badge>A</Badge>
        <Badge>B</Badge>
      </BadgeGroup>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
