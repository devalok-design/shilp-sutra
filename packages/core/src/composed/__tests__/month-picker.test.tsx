import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { MonthPicker } from '../date-picker/month-picker'

describe('MonthPicker', () => {
  const defaultProps = {
    currentYear: 2026,
    onMonthSelect: vi.fn(),
  }

  it('renders month buttons', () => {
    render(<MonthPicker {...defaultProps} />)
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MonthPicker {...defaultProps} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<MonthPicker ref={ref} {...defaultProps} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(<MonthPicker className="custom" {...defaultProps} />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<MonthPicker data-testid="mp" {...defaultProps} />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'mp')
  })
})
