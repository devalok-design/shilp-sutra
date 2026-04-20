import { render, screen } from '@testing-library/react'
import { afterEach,describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { DeadlineIndicator } from './deadline-indicator'

describe('DeadlineIndicator', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders green (success) for a far-off deadline', () => {
    // Freeze time to a known value
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // 7 days in the future
    const deadline = new Date('2026-03-24T12:00:00Z')
    const { container } = render(<DeadlineIndicator deadline={deadline} />)
    expect(container.firstElementChild).toHaveClass('text-success-11')
    expect(screen.getByText('7d left')).toBeInTheDocument()
  })

  it('renders warning for deadline within warning threshold', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // 12 hours in the future (720 min, within default 1440 min warning)
    const deadline = new Date('2026-03-18T00:00:00Z')
    const { container } = render(<DeadlineIndicator deadline={deadline} />)
    expect(container.firstElementChild).toHaveClass('text-warning-11')
    expect(screen.getByText('12h left')).toBeInTheDocument()
  })

  it('renders critical for deadline within critical threshold', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // 2 hours in the future (120 min, within default 240 min critical)
    const deadline = new Date('2026-03-17T14:00:00Z')
    const { container } = render(<DeadlineIndicator deadline={deadline} />)
    expect(container.firstElementChild).toHaveClass('text-error-11')
    expect(screen.getByText('2h left')).toBeInTheDocument()
  })

  it('renders "Overdue" with bold error for past deadline', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // 2 days in the past
    const deadline = new Date('2026-03-15T12:00:00Z')
    const { container } = render(<DeadlineIndicator deadline={deadline} />)
    expect(container.firstElementChild).toHaveClass('text-error-11')
    expect(container.firstElementChild).toHaveClass('font-semibold')
    expect(screen.getByText('Overdue by 2d')).toBeInTheDocument()
  })

  it('renders "Overdue" for a deadline just past', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // 30 seconds ago — less than 1 minute
    const deadline = new Date(now - 30_000)
    render(<DeadlineIndicator deadline={deadline} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('renders with showIcon', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    const deadline = new Date('2026-03-24T12:00:00Z')
    const { container } = render(<DeadlineIndicator deadline={deadline} showIcon />)
    // tabler IconClock renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('accepts deadline as a string', () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    render(<DeadlineIndicator deadline="2026-03-24T12:00:00Z" />)
    expect(screen.getByText('7d left')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const now = new Date('2026-03-17T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    const { container } = render(
      <DeadlineIndicator deadline={new Date('2026-03-24T12:00:00Z')} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
