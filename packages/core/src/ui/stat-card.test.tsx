import { fireEvent,render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { StatCard } from './stat-card'

describeConformance(
  'StatCard',
  (props) => <StatCard label="Revenue" value="$48,200" {...props} />,
)

describe('StatCard', () => {
  // ── Basic rendering ────────────────────────────────────────────────────────
  it('renders label and value', () => {
    render(<StatCard label="Revenue" value="$48,200" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$48,200')).toBeInTheDocument()
  })

  it('renders title as alias for label', () => {
    render(<StatCard title="Users" value={142} />)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })

  it('renders prefix and suffix', () => {
    render(<StatCard label="Sales" value="1,200" prefix="$" suffix="items" />)
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('items')).toBeInTheDocument()
  })

  // ── Delta display ──────────────────────────────────────────────────────────
  it('renders delta with up direction', () => {
    render(
      <StatCard
        label="Revenue"
        value="$48,200"
        delta={{ value: '+12%', direction: 'up' }}
      />,
    )
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('renders delta with down direction', () => {
    render(
      <StatCard
        label="Tickets"
        value={142}
        delta={{ value: '-18', direction: 'down' }}
      />,
    )
    expect(screen.getByText('-18')).toBeInTheDocument()
  })

  it('renders delta with neutral direction', () => {
    render(
      <StatCard
        label="Storage"
        value="4.2 GB"
        delta={{ value: 'No change', direction: 'neutral' }}
      />,
    )
    expect(screen.getByText('No change')).toBeInTheDocument()
  })

  it('renders comparison label next to delta', () => {
    render(
      <StatCard
        label="Revenue"
        value="$48,200"
        delta={{ value: '+12%', direction: 'up' }}
        comparisonLabel="vs last month"
      />,
    )
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  it('renders skeleton when loading', () => {
    const { container } = render(<StatCard label="Users" value={0} loading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(1)
    // Value should not be shown
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  // ── Clickable mode ─────────────────────────────────────────────────────────
  it('becomes role="button" with tabIndex when onClick is provided', () => {
    const onClick = vi.fn()
    render(<StatCard label="Revenue" value="$48,200" onClick={onClick} />)
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabindex', '0')
  })

  it('fires onClick on click', () => {
    const onClick = vi.fn()
    render(<StatCard label="Revenue" value="$48,200" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fires onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<StatCard label="Revenue" value="$48,200" onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fires onClick on Space key', () => {
    const onClick = vi.fn()
    render(<StatCard label="Revenue" value="$48,200" onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('auto-generates aria-label for clickable cards', () => {
    render(<StatCard label="Revenue" value="$48,200" onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'View Revenue')
  })

  // ── Progress bar ───────────────────────────────────────────────────────────
  it('renders progress bar with correct ARIA attributes', () => {
    render(<StatCard label="Target" value="$35,000" progress={70} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '70')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-label', 'Target progress')
  })

  it('clamps progress to 0-100 range', () => {
    render(<StatCard label="Target" value="$35,000" progress={150} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '100')
  })

  // ── Secondary label ────────────────────────────────────────────────────────
  it('renders secondary label', () => {
    render(
      <StatCard label="Sales" value="$35,000" secondaryLabel="of $50,000 target" />,
    )
    expect(screen.getByText('of $50,000 target')).toBeInTheDocument()
  })

  // ── Footer ─────────────────────────────────────────────────────────────────
  it('renders footer content', () => {
    render(
      <StatCard label="Sales" value="$35,000" footer={<span>View details</span>} />,
    )
    expect(screen.getByText('View details')).toBeInTheDocument()
  })

})
