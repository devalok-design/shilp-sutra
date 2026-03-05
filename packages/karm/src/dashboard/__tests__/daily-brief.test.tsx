import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { DailyBrief } from '../daily-brief'
import type { BriefData } from '../daily-brief'

const briefData: BriefData = {
  brief: [
    'You have **3 tasks** due today.',
    'Team standup at 10 AM.',
    'Client demo scheduled for 2 PM.',
  ],
  generatedAt: new Date().toISOString(),
}

describe('DailyBrief', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <DailyBrief data={briefData} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders Morning Brief heading', () => {
    render(<DailyBrief data={briefData} />)
    expect(screen.getByText('Morning Brief')).toBeInTheDocument()
  })

  it('renders brief items', () => {
    render(<DailyBrief data={briefData} />)
    expect(screen.getByText(/3 tasks/)).toBeInTheDocument()
    expect(screen.getByText(/Team standup/)).toBeInTheDocument()
    expect(screen.getByText(/Client demo/)).toBeInTheDocument()
  })

  it('renders loading skeleton', () => {
    const { container } = render(<DailyBrief data={null} loading />)
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('renders nothing when data is null and not loading', () => {
    const { container } = render(<DailyBrief data={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when brief array is empty', () => {
    const { container } = render(
      <DailyBrief data={{ brief: [], generatedAt: new Date().toISOString() }} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
