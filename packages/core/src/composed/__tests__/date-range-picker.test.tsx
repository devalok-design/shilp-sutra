import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { DateRangePicker } from '../date-picker/date-range-picker'

describe('DateRangePicker', () => {
  it('renders trigger button', () => {
    render(<DateRangePicker />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DateRangePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref to trigger button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<DateRangePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges className on trigger', () => {
    render(<DateRangePicker className="custom" />)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })
})
