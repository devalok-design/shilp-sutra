import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('contains screen reader text "Loading..." in spinning state', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders an SVG element inside the status container', () => {
    render(<Spinner />)
    const status = screen.getByRole('status')
    const svg = status.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    let svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('h-ico-sm', 'w-ico-sm')

    rerender(<Spinner size="lg" />)
    svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('h-ico-lg', 'w-ico-lg')
  })

  it('shows "Complete" sr text when state is success', () => {
    render(<Spinner state="success" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('shows "Error" sr text when state is error', () => {
    render(<Spinner state="error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('does not render until delay has elapsed', () => {
    render(<Spinner delay={200} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders immediately when delay is 0', () => {
    render(<Spinner delay={0} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a background track circle', () => {
    render(<Spinner />)
    const circles = screen.getByRole('status').querySelectorAll('circle')
    // At least 2 circles: track + animated arc
    expect(circles.length).toBeGreaterThanOrEqual(2)
  })
})
