import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { DateSeparator } from './date-separator'
import { UnreadSeparator } from './unread-separator'

describe('DateSeparator', () => {
  it('renders "Today" for today', () => {
    render(<DateSeparator date={new Date()} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders "Yesterday" for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    render(<DateSeparator date={yesterday} />)
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
  })

  it('renders "Mar 25" for dates within this year', () => {
    const now = new Date()
    const thisYear = now.getFullYear()
    // Pick a date earlier this year that isn't today or yesterday
    const date = new Date(thisYear, 2, 25) // March 25
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    // Only run if it's not today or yesterday
    if (diffDays > 1) {
      render(<DateSeparator date={date} />)
      expect(screen.getByText('Mar 25')).toBeInTheDocument()
    } else {
      // If March 25 is today or yesterday, use a different date
      const altDate = new Date(thisYear, 0, 15) // Jan 15
      render(<DateSeparator date={altDate} />)
      expect(screen.getByText('Jan 15')).toBeInTheDocument()
    }
  })

  it('renders year for dates in a different year', () => {
    const date = new Date(2020, 2, 25) // March 25, 2020 — definitively past
    render(<DateSeparator date={date} />)
    expect(screen.getByText('Mar 25, 2020')).toBeInTheDocument()
  })

  it('uses custom format function', () => {
    const customFormat = (d: Date) => `Custom: ${d.getFullYear()}`
    render(<DateSeparator date={new Date(2025, 0, 1)} format={customFormat} />)
    expect(screen.getByText('Custom: 2025')).toBeInTheDocument()
  })

  it('accepts string date', () => {
    render(<DateSeparator date={new Date().toISOString()} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})

describe('UnreadSeparator', () => {
  it('renders "NEW" by default', () => {
    render(<UnreadSeparator />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('renders "3 NEW" when count=3', () => {
    render(<UnreadSeparator count={3} />)
    expect(screen.getByText('3 NEW')).toBeInTheDocument()
  })

  it('uses custom label', () => {
    render(<UnreadSeparator label="UNREAD" />)
    expect(screen.getByText('UNREAD')).toBeInTheDocument()
  })

  it('combines count with custom label', () => {
    render(<UnreadSeparator label="MESSAGES" count={5} />)
    expect(screen.getByText('5 MESSAGES')).toBeInTheDocument()
  })

  it('has accent-7 border', () => {
    const { container } = render(<UnreadSeparator />)
    const lines = container.querySelectorAll('.border-accent-7')
    expect(lines.length).toBe(2)
  })
})
