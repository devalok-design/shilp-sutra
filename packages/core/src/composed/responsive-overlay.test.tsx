import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ResponsiveOverlay } from './responsive-overlay'

describe('ResponsiveOverlay', () => {
  it('renders title when open (desktop mode renders Dialog)', () => {
    // matchMedia is mocked to return matches:false in test-setup → desktop → Dialog
    render(
      <ResponsiveOverlay open={true} onOpenChange={vi.fn()} title="My Overlay">
        <p>Overlay content</p>
      </ResponsiveOverlay>,
    )
    expect(screen.getByText('My Overlay')).toBeInTheDocument()
  })

  it('renders children when open', () => {
    render(
      <ResponsiveOverlay open={true} onOpenChange={vi.fn()} title="Title">
        <p>Child content here</p>
      </ResponsiveOverlay>,
    )
    expect(screen.getByText('Child content here')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <ResponsiveOverlay
        open={true}
        onOpenChange={vi.fn()}
        title="Title"
        description="A helpful description"
      >
        <p>Body</p>
      </ResponsiveOverlay>,
    )
    expect(screen.getByText('A helpful description')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <ResponsiveOverlay open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Should not appear</p>
      </ResponsiveOverlay>,
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument()
  })
})
