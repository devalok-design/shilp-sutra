import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { DevalokGrain } from './devalok-grain'

describe('DevalokGrain', () => {
  it('renders with aria-hidden so it is invisible to assistive tech', () => {
    const { container } = render(<DevalokGrain />)
    const root = container.querySelector('[data-grain]')
    expect(root).toBeInTheDocument()
    expect(root).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes axe audit', async () => {
    const { container } = render(<DevalokGrain />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('is pointer-events-none and absolutely positioned so it never blocks interaction', () => {
    const { container } = render(<DevalokGrain />)
    const root = container.querySelector('[data-grain]')
    expect(root).toHaveClass('pointer-events-none', 'absolute', 'inset-0')
  })

  it('renders a neutral gradient (light + dark variants) when no tint is provided', () => {
    const { container } = render(<DevalokGrain />)
    const lightGradient = container.querySelector('.dark\\:hidden') as HTMLElement
    const darkGradient = container.querySelector('.dark\\:block')
    expect(lightGradient.style.background).toContain('linear-gradient')
    expect(lightGradient.style.background).toContain('oklch(0 0 0')
    expect(darkGradient).toBeInTheDocument()
  })

  it('renders a tinted gradient using color-mix when tint is provided', () => {
    const { container } = render(<DevalokGrain tint="oklch(0.55 0.19 360)" />)
    const lightGradient = container.querySelector('.dark\\:hidden') as HTMLElement
    expect(lightGradient.style.background).toContain('color-mix')
  })

  it('does not render a sheen highlight by default', () => {
    const { container } = render(<DevalokGrain />)
    expect(container.querySelector('.shadow-raised-inner')).not.toBeInTheDocument()
  })

  it('renders a sheen highlight when sheen is true', () => {
    const { container } = render(<DevalokGrain sheen />)
    expect(container.querySelector('.shadow-raised-inner')).toBeInTheDocument()
  })

  it('renders as a plain span when animated is false', () => {
    const { container } = render(<DevalokGrain />)
    const root = container.querySelector('[data-grain]')
    expect(root?.tagName).toBe('SPAN')
  })

  it('renders (and does not crash) when animated is true', () => {
    const { container } = render(<DevalokGrain animated />)
    const root = container.querySelector('[data-grain]')
    expect(root).toBeInTheDocument()
  })

  it('does not apply hover-intensify classes by default', () => {
    const { container } = render(<DevalokGrain />)
    const noiseLayer = container.querySelector('[style*="background-image"]')
    expect(noiseLayer?.className).not.toContain('group-hover:opacity-[var(--grain-hover-opacity)]')
  })

  it('applies hover-intensify class and CSS variable when hoverIntensify is true', () => {
    const { container } = render(<DevalokGrain hoverIntensify intensity="subtle" surface="solid" />)
    const noiseLayer = container.querySelector('[style*="background-image"]') as HTMLElement
    expect(noiseLayer.className).toContain('group-hover:opacity-[var(--grain-hover-opacity)]')
    // subtle/solid noise is 0.20 → hover should be 0.20 * 1.4 = 0.28
    expect(Number(noiseLayer.style.getPropertyValue('--grain-hover-opacity'))).toBeCloseTo(0.28, 5)
  })

  it('caps the hover opacity at 0.6 for heavy intensity', () => {
    const { container } = render(<DevalokGrain hoverIntensify intensity="heavy" surface="solid" />)
    const noiseLayer = container.querySelector('[style*="background-image"]') as HTMLElement
    // heavy/solid noise is 0.45 → 0.45 * 1.4 = 0.63, capped to 0.6
    expect(noiseLayer.style.getPropertyValue('--grain-hover-opacity')).toBe('0.6')
  })

  it('applies different base noise opacity for solid vs soft surface', () => {
    const { container: solidContainer } = render(
      <DevalokGrain intensity="medium" surface="solid" />,
    )
    const { container: softContainer } = render(
      <DevalokGrain intensity="medium" surface="soft" />,
    )
    const solidNoise = solidContainer.querySelector('[style*="background-image"]') as HTMLElement
    const softNoise = softContainer.querySelector('[style*="background-image"]') as HTMLElement
    expect(solidNoise.style.opacity).toBe('0.28')
    expect(softNoise.style.opacity).toBe('0.22')
  })

  it('defaults to subtle intensity and solid surface', () => {
    const { container } = render(<DevalokGrain />)
    const noiseLayer = container.querySelector('[style*="background-image"]') as HTMLElement
    expect(noiseLayer.style.opacity).toBe('0.2')
  })

  it('has a stable displayName', () => {
    expect(DevalokGrain.displayName).toBe('DevalokGrain')
  })
})
