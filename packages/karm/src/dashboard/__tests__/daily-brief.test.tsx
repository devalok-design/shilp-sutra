import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

  // ---- New tests ----

  it('renders relative timestamp', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    render(
      <DailyBrief data={{ ...briefData, generatedAt: thirtyMinAgo }} />,
    )
    expect(screen.getByText('Generated 30m ago')).toBeInTheDocument()
  })

  it('renders "just now" for very recent timestamps', () => {
    const justNow = new Date().toISOString()
    render(
      <DailyBrief data={{ ...briefData, generatedAt: justNow }} />,
    )
    expect(screen.getByText('Generated just now')).toBeInTheDocument()
  })

  it('renders hours-ago timestamp', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    render(
      <DailyBrief data={{ ...briefData, generatedAt: twoHoursAgo }} />,
    )
    expect(screen.getByText('Generated 2h ago')).toBeInTheDocument()
  })

  it('renders days-ago timestamp', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    render(
      <DailyBrief data={{ ...briefData, generatedAt: twoDaysAgo }} />,
    )
    expect(screen.getByText('Generated 2d ago')).toBeInTheDocument()
  })

  it('calls onRefresh when refresh button clicked', () => {
    const onRefresh = vi.fn()
    render(<DailyBrief data={briefData} onRefresh={onRefresh} />)
    const refreshBtn = screen.getByLabelText('Refresh brief')
    fireEvent.click(refreshBtn)
    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('does not render refresh button when onRefresh is not provided', () => {
    render(<DailyBrief data={briefData} />)
    expect(screen.queryByLabelText('Refresh brief')).not.toBeInTheDocument()
  })

  it('shows unavailable state', () => {
    render(<DailyBrief data={null} unavailable />)
    expect(screen.getByText('AI brief unavailable')).toBeInTheDocument()
  })

  it('shows unavailable state even when data is provided', () => {
    render(<DailyBrief data={briefData} unavailable />)
    expect(screen.getByText('AI brief unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Morning Brief')).not.toBeInTheDocument()
  })

  it('supports defaultCollapsed — content hidden initially', () => {
    render(<DailyBrief data={briefData} defaultCollapsed />)
    expect(screen.getByText('Morning Brief')).toBeInTheDocument()
    // With grid collapse animation, content is in DOM but visually hidden via overflow-hidden + grid-rows-[0fr]
    const contentText = screen.getByText(/3 tasks/)
    expect(contentText.closest('.overflow-hidden')?.parentElement).toHaveClass('grid-rows-[0fr]')
  })

  it('supports custom title', () => {
    render(<DailyBrief data={briefData} title="Daily Digest" />)
    expect(screen.getByText('Daily Digest')).toBeInTheDocument()
    expect(screen.queryByText('Morning Brief')).not.toBeInTheDocument()
  })

  it('always shows content when collapsible is false', () => {
    render(<DailyBrief data={briefData} collapsible={false} />)
    expect(screen.getByText(/3 tasks/)).toBeInTheDocument()
    // No toggle button
    expect(screen.queryByLabelText('Toggle brief')).not.toBeInTheDocument()
  })

  it('has no a11y violations with onRefresh', async () => {
    const { container } = render(
      <DailyBrief data={briefData} onRefresh={() => {}} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations in unavailable state', async () => {
    const { container } = render(
      <DailyBrief data={null} unavailable />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
