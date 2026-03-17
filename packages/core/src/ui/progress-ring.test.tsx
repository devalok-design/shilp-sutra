import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressRing, MultiProgressRing } from './progress-ring'

describe('ProgressRing', () => {
  it('renders SVG with progressbar role', () => {
    render(<ProgressRing value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('sets aria-valuenow', () => {
    render(<ProgressRing value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('sets aria-valuemax from max prop', () => {
    render(<ProgressRing value={3} max={12} />)
    const ring = screen.getByRole('progressbar')
    expect(ring).toHaveAttribute('aria-valuemax', '12')
  })

  it('shows percentage text when showValue is true', () => {
    render(<ProgressRing value={75} showValue />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('does not show percentage text by default', () => {
    render(<ProgressRing value={75} />)
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('uses custom label for aria-label', () => {
    render(<ProgressRing value={50} label="Upload progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress')
  })

  it('clamps value between 0 and max', () => {
    render(<ProgressRing value={150} showValue />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})

describe('MultiProgressRing', () => {
  it('renders SVG with group role', () => {
    render(
      <MultiProgressRing
        rings={[
          { value: 80, color: 'error' },
          { value: 60, color: 'success' },
        ]}
      />,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('renders track and value circles for each ring', () => {
    const { container } = render(
      <MultiProgressRing
        rings={[
          { value: 80 },
          { value: 60 },
        ]}
      />,
    )
    // 2 rings × 2 circles each (track + value) = 4 circles
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(4)
  })
})
