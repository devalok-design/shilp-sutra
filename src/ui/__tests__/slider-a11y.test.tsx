import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, beforeAll } from 'vitest'
import { Slider } from '../slider'

// Slider's Radix primitive uses ResizeObserver which jsdom doesn't provide
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof globalThis.ResizeObserver
  }
})

describe('Slider accessibility', () => {
  it('should have no violations with aria-label', async () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[50]} max={100} step={1} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with min and max range', async () => {
    const { container } = render(
      <Slider
        aria-label="Price range"
        defaultValue={[25]}
        min={0}
        max={100}
        step={5}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Slider aria-label="Brightness" defaultValue={[75]} disabled />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
