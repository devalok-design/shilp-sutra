import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { PriorityIndicator } from './priority-indicator'

describe('PriorityIndicator', () => {
  it('renders Low priority with label', () => {
    render(<PriorityIndicator priority="LOW" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders Medium priority with label', () => {
    render(<PriorityIndicator priority="MEDIUM" />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders High priority with label', () => {
    render(<PriorityIndicator priority="HIGH" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders Urgent priority with label', () => {
    render(<PriorityIndicator priority="URGENT" />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('normalizes lowercase priority values', () => {
    render(<PriorityIndicator priority="low" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders compact display with title attribute', () => {
    const { container } = render(<PriorityIndicator priority="HIGH" display="compact" />)
    const el = container.querySelector('[title="High"]')
    expect(el).toBeInTheDocument()
    // Should not render a text label in compact mode
    expect(screen.queryByText('High')).not.toBeInTheDocument()
  })

  it('renders an SVG icon', () => {
    const { container } = render(<PriorityIndicator priority="LOW" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<PriorityIndicator priority="LOW" className="my-priority" />)
    expect(container.firstElementChild).toHaveClass('my-priority')
  })
})
