import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { DashboardSkeleton } from '../dashboard-skeleton'

describe('DashboardSkeleton', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<DashboardSkeleton />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders skeleton placeholder elements', () => {
    const { container } = render(<DashboardSkeleton />)
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders navigation buttons', () => {
    render(<DashboardSkeleton />)
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('renders tab headers', () => {
    render(<DashboardSkeleton />)
    expect(screen.getByText(/REQUESTS/)).toBeInTheDocument()
    expect(screen.getByText(/ATTENDANCE CORRECTION/)).toBeInTheDocument()
  })
})
