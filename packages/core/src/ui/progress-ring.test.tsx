import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { MultiProgressRing,ProgressRing } from './progress-ring'

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

  it('renders a text element when showValue is true', () => {
    const { container } = render(<ProgressRing value={75} showValue />)
    expect(container.querySelector('text')).toBeInTheDocument()
  })

  it('does not render a text element by default', () => {
    const { container } = render(<ProgressRing value={75} />)
    expect(container.querySelector('text')).not.toBeInTheDocument()
  })

  it('uses custom label for aria-label', () => {
    render(<ProgressRing value={50} label="Upload progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress')
  })

  it('clamps aria-label percentage between 0 and max', () => {
    render(<ProgressRing value={150} showValue />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '100% progress')
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
