import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { ProcessingOverlay } from '../button-processing'

describe('ProcessingOverlay', () => {
  it('renders when active', () => {
    const { container } = render(
      <ProcessingOverlay active speed="working" color="accent" />,
    )
    // The overlay renders with aria-hidden="true"
    const overlay = container.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    const { container } = render(
      <ProcessingOverlay active={false} speed="working" color="accent" />,
    )
    const overlay = container.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeNull()
  })

  it('accepts different speed values', () => {
    const { container } = render(
      <ProcessingOverlay active speed="urgent" color="error" />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('has no accessibility violations when active', async () => {
    const { container } = render(
      <div>
        <button type="button">Save</button>
        <ProcessingOverlay active speed="working" color="accent" />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
