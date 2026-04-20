import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { DateTimePicker } from '../date-picker/date-time-picker'

describe('DateTimePicker', () => {
  it('renders trigger button', () => {
    render(<DateTimePicker />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DateTimePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref to trigger button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<DateTimePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges className on trigger', () => {
    render(<DateTimePicker className="custom" />)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })
})
