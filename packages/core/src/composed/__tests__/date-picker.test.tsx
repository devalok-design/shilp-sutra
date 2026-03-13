import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { DatePicker } from '../date-picker/date-picker'

describe('DatePicker', () => {
  it('renders trigger button', () => {
    render(<DatePicker />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows placeholder text', () => {
    render(<DatePicker placeholder="Select date" />)
    expect(screen.getByText('Select date')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DatePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref to trigger button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<DatePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges className on trigger', () => {
    render(<DatePicker className="custom" />)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })

  it('displays formatted date when value is set', () => {
    render(<DatePicker value={new Date(2026, 0, 15)} />)
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument()
  })
})
