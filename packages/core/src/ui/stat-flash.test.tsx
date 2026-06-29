import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatFlash } from './stat-flash'

describe('StatFlash', () => {
  it('renders a preset flash without crashing', () => {
    const { container } = render(<StatFlash icon={<svg data-testid="identity" />} flash="up" />)
    // Renders the chip wrapper (decorative).
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    // Identity icon is in the DOM (even mid-animation).
    expect(container.querySelector('[data-testid="identity"]')).toBeInTheDocument()
  })

  it('accepts an explicit { tone, icon } spec', () => {
    const { container } = render(
      <StatFlash
        icon={<svg data-testid="identity" />}
        flash={{ tone: 'info', icon: <svg data-testid="flash-glyph" /> }}
      />,
    )
    expect(container.querySelector('[data-testid="identity"]')).toBeInTheDocument()
  })

  it('renders solid fill variant', () => {
    const { container } = render(
      <StatFlash icon={<svg />} flash="record" fill="solid" />,
    )
    expect(container.firstChild).toHaveClass('bg-accent-9')
  })

  it('renders soft fill by default', () => {
    const { container } = render(<StatFlash icon={<svg />} flash="alert" />)
    expect(container.firstChild).toHaveClass('bg-accent-3')
  })
})
