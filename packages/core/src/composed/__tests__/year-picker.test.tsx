import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { YearPicker } from '../date-picker/year-picker'

describe('YearPicker', () => {
  const defaultProps = {
    currentYear: 2026,
    onYearSelect: vi.fn(),
  }

  it('renders year buttons', () => {
    render(<YearPicker {...defaultProps} />)
    // Decade starting at 2020
    expect(screen.getByText('2020')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<YearPicker {...defaultProps} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<YearPicker ref={ref} {...defaultProps} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(<YearPicker className="custom" {...defaultProps} />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<YearPicker data-testid="yp" {...defaultProps} />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'yp')
  })
})
