import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatRowBlock } from '../../blocks/stat-row'

const stats = [
  { label: 'Revenue', value: '$48,200', change: { value: '+12%', direction: 'up' as const } },
  { label: 'Users', value: 1420, change: { value: '-3%', direction: 'down' as const } },
  { label: 'Uptime', value: '99.9%' },
]

describe('StatRowBlock', () => {
  it('renders all stat labels', () => {
    render(<StatRowBlock data={{ stats }} />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
  })

  it('renders all stat values', () => {
    render(<StatRowBlock data={{ stats }} />)
    expect(screen.getByText('$48,200')).toBeInTheDocument()
    expect(screen.getByText('1420')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
  })

  it('renders change/delta when provided', () => {
    render(<StatRowBlock data={{ stats }} />)
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('-3%')).toBeInTheDocument()
  })

  it('handles missing change gracefully', () => {
    render(<StatRowBlock data={{ stats }} />)
    // Uptime stat has no change — should render without error
    expect(screen.getByText('Uptime')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
  })

  it('does not crash with empty stats array', () => {
    const { container } = render(<StatRowBlock data={{ stats: [] }} />)
    // Should render nothing (returns null)
    expect(container.firstChild).toBeNull()
  })
})
