import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { StatCard } from '../stat-card'

describe('StatCard accessibility', () => {
  it('should have no violations with label and value', async () => {
    const { container } = render(
      <StatCard label="Total Users" value="12,345" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with an upward delta', async () => {
    const { container } = render(
      <StatCard
        label="Revenue"
        value="$48,200"
        delta={{ value: '+12.5%', direction: 'up' }}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a downward delta', async () => {
    const { container } = render(
      <StatCard
        label="Churn Rate"
        value="3.2%"
        delta={{ value: '-0.8%', direction: 'down' }}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a neutral delta', async () => {
    const { container } = render(
      <StatCard
        label="Active Sessions"
        value="1,024"
        delta={{ value: '0%', direction: 'neutral' }}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in loading state', async () => {
    const { container } = render(
      <StatCard label="Loading" value="" loading />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
