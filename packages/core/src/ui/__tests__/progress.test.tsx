import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from '../progress'

/**
 * Helper: returns the indicator element inside the progressbar.
 * For determinate values, framer-motion's `motion.div` renders as a plain div,
 * so we look for the child that carries the CVA color class.
 */
function getIndicator() {
  const root = screen.getByRole('progressbar')
  // The indicator is the first (and only) child of the Radix Root
  return root.firstElementChild as HTMLElement
}

describe('Progress autoColor', () => {
  it('value=50 → default color (bg-accent-9)', () => {
    render(<Progress autoColor value={50} />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-accent-9')
  })

  it('value=70 → warning color (bg-warning-9)', () => {
    render(<Progress autoColor value={70} />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-warning-9')
  })

  it('value=90 → success color (bg-success-9)', () => {
    render(<Progress autoColor value={90} />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-success-9')
  })

  it('value=105 → error color (bg-error-9)', () => {
    render(<Progress autoColor value={105} />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-error-9')
  })

  it('autoColor=false uses manual color prop', () => {
    render(<Progress value={50} color="success" />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-success-9')
  })

  it('autoColor=true with value=undefined (indeterminate) → uses default color', () => {
    render(<Progress autoColor />)
    const indicator = getIndicator()
    expect(indicator.className).toContain('bg-accent-9')
  })
})
