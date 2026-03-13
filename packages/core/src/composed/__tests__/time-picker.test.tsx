import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { TimePicker } from '../date-picker/time-picker'

describe('TimePicker', () => {
  it('renders trigger button', () => {
    render(<TimePicker />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<TimePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref to trigger button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<TimePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges className on trigger', () => {
    render(<TimePicker className="custom" />)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })
})
