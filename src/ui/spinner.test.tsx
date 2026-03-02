import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('contains screen reader text "Loading..."', () => {
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
    expect(svg).toHaveClass('h-[var(--icon-sm)]', 'w-[var(--icon-sm)]')

    rerender(<Spinner size="lg" />)
    svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('h-[var(--icon-lg)]', 'w-[var(--icon-lg)]')
  })

  it('applies the animate-spin class', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('animate-spin')
  })
})
