import { render } from '@testing-library/react'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub the WebGL shader lib — jsdom has no GL context, and these tests only
// assert the static/live branching, not shader output.
vi.mock('@paper-design/shaders-react', () => ({
  MeshGradient: (props: Record<string, unknown>) => (
    <div data-testid="mesh-gradient" style={props.style as React.CSSProperties} />
  ),
}))

import {
  AURORA_PRESETS,
  AuroraBloom,
  DEFAULT_PALETTE,
  FALLBACK_PALETTE,
  paletteKey,
} from './index'

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  setReducedMotion(false)
})

describe('AuroraBloom rendering', () => {
  it('renders the live WebGL shader by default', () => {
    const { container } = render(<AuroraBloom />)
    const root = container.querySelector('[data-aurora-bloom]')
    expect(root).toHaveAttribute('data-aurora-mode', 'live')
    expect(container.querySelectorAll('[data-testid="mesh-gradient"]').length).toBeGreaterThan(0)
  })

  it('is decorative (aria-hidden) and does not capture pointer events', () => {
    const { container } = render(<AuroraBloom />)
    const root = container.querySelector('[data-aurora-bloom]')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root?.className).toContain('pointer-events-none')
  })

  it('renders a static gradient (no WebGL) under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { container } = render(<AuroraBloom />)
    const root = container.querySelector('[data-aurora-bloom]')
    expect(root).toHaveAttribute('data-aurora-mode', 'static')
    expect(container.querySelector('[data-testid="mesh-gradient"]')).toBeNull()
  })

  it('poster mode upgrades to the live shader after mount', () => {
    // The pre-mount (SSR / first-paint) render is static; after the mount
    // effect fires — which testing-library flushes — it upgrades to live.
    const { container } = render(<AuroraBloom poster />)
    expect(container.querySelector('[data-aurora-bloom]')).toHaveAttribute(
      'data-aurora-mode',
      'live',
    )
    expect(container.querySelectorAll('[data-testid="mesh-gradient"]').length).toBeGreaterThan(0)
  })

  it('poster mode still renders static under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { container } = render(<AuroraBloom poster />)
    expect(container.querySelector('[data-aurora-bloom]')).toHaveAttribute(
      'data-aurora-mode',
      'static',
    )
  })

  it('respects a custom hex palette without touching the brand hook', () => {
    const { container } = render(
      <AuroraBloom palette={['#000000', '#111111', '#222222', '#333333', '#444444']} />,
    )
    expect(container.querySelector('[data-aurora-bloom]')).toBeInTheDocument()
  })
})

describe('AURORA_PRESETS', () => {
  it('exposes six presets, each with a complete prop set', () => {
    const ids = Object.keys(AURORA_PRESETS)
    expect(ids).toHaveLength(6)
    for (const id of ids) {
      const p = AURORA_PRESETS[id as keyof typeof AURORA_PRESETS]
      expect(p.id).toBe(id)
      expect(p.name).toBeTruthy()
      expect(p.props.intensity).toBeTruthy()
      expect(p.props.shape).toBeTruthy()
    }
  })

  it('only the devalok preset follows the live brand ramp', () => {
    expect(AURORA_PRESETS.devalok.props.palette).toBe('brand')
    for (const id of ['bhairav', 'saptarishi', 'diya', 'monsoon', 'mandir'] as const) {
      expect(Array.isArray(AURORA_PRESETS[id].props.palette)).toBe(true)
    }
  })
})

describe('palette helpers', () => {
  it('FALLBACK_PALETTE aliases DEFAULT_PALETTE', () => {
    expect(FALLBACK_PALETTE).toBe(DEFAULT_PALETTE)
  })

  it('paletteKey is stable and distinguishes theme', () => {
    const light = { colors: ['#a', '#b'], ground: '#fff', isDark: false }
    const dark = { ...light, isDark: true }
    expect(paletteKey(light)).toBe(paletteKey({ ...light }))
    expect(paletteKey(light)).not.toBe(paletteKey(dark))
  })
})
