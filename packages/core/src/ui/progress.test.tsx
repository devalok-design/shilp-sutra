import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Progress } from './progress'

describeConformance('Progress', (props) => <Progress value={50} aria-label="Upload" {...props} />, {
  sizes: ['sm', 'md', 'lg'],
})

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

  it('shows percentage value when showValue is true', () => {
    render(<Progress value={42} showValue />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('does not show value by default', () => {
    render(<Progress value={42} />)
    expect(screen.queryByText('42%')).not.toBeInTheDocument()
  })

  it('does not show value for indeterminate state', () => {
    render(<Progress showValue />)
    expect(screen.queryByText('%')).not.toBeInTheDocument()
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
})
