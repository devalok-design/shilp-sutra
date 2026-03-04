import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { Calendar } from '../calendar'

describe('Calendar', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <Calendar onDateSelect={vi.fn()} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders navigation buttons', () => {
    render(<Calendar onDateSelect={vi.fn()} />)
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('renders Weekly and Monthly toggle options', () => {
    render(<Calendar onDateSelect={vi.fn()} />)
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('renders day buttons', () => {
    const { container } = render(
      <Calendar onDateSelect={vi.fn()} />,
    )
    const buttons = container.querySelectorAll('button[aria-label]')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
