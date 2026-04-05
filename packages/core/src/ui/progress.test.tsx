import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Progress } from './progress'

describe('Progress', () => {
  it('renders with progressbar role', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('sets aria-valuenow from value prop', () => {
    render(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('sets aria-valuenow to 0 when value is 0', () => {
    render(<Progress value={0} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('renders indeterminate state when value is undefined', () => {
    render(<Progress />)
    const bar = screen.getByRole('progressbar')
    expect(bar).not.toHaveAttribute('aria-valuenow')
  })

  it('shows percentage label when showLabel is true', () => {
    render(<Progress value={42} showLabel />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('does not show label by default', () => {
    render(<Progress value={42} />)
    expect(screen.queryByText('42%')).not.toBeInTheDocument()
  })

  it('does not show label for indeterminate state', () => {
    render(<Progress showLabel />)
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('applies size variant classes', () => {
    const { rerender } = render(<Progress value={50} size="sm" />)
    expect(screen.getByRole('progressbar').className).toContain('h-1')

    rerender(<Progress value={50} size="md" />)
    expect(screen.getByRole('progressbar').className).toContain('h-2')

    rerender(<Progress value={50} size="lg" />)
    expect(screen.getByRole('progressbar').className).toContain('h-3')
  })

  it('merges custom className on track', () => {
    render(<Progress value={50} className="my-progress" />)
    expect(screen.getByRole('progressbar').className).toContain('my-progress')
  })

  it('applies autoColor based on value', () => {
    const { container, rerender } = render(<Progress value={40} autoColor />)
    // 0-59 = default (accent)
    let indicator = container.querySelector('[class*="accent"]')
    expect(indicator).toBeInTheDocument()

    // 60-84 = warning
    rerender(<Progress value={70} autoColor />)
    indicator = container.querySelector('[class*="warning"]')
    expect(indicator).toBeInTheDocument()

    // 85-100 = success
    rerender(<Progress value={90} autoColor />)
    indicator = container.querySelector('[class*="success"]')
    expect(indicator).toBeInTheDocument()

    // >100 = error
    rerender(<Progress value={110} autoColor />)
    indicator = container.querySelector('[class*="error"]')
    expect(indicator).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Progress value={60} aria-label="Upload progress" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
