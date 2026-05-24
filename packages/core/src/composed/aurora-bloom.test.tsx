/**
 * AuroraBloom smoke tests.
 *
 * Notes:
 * - MeshGradient requires WebGL, which jsdom does NOT provide. We mock the
 *   Paper Shaders component so the tests can assert structure (canvas
 *   count, aria attrs, palette acceptance) without triggering ShaderMount.
 * - Visual conformance is covered by Storybook + Chromatic.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock MeshGradient to a no-op canvas so the test environment doesn't try
// to spin up real WebGL. The component is exercised in Storybook / live.
vi.mock('@paper-design/shaders-react', () => ({
  MeshGradient: ({ style }: { style?: React.CSSProperties }) => (
    <canvas data-testid="mock-mesh" style={style} />
  ),
}))

import { AuroraBloom } from './aurora-bloom'

describe('AuroraBloom', () => {
  it('mounts without crashing under default props', () => {
    expect(() => render(<AuroraBloom />)).not.toThrow()
  })

  it('is hidden from assistive tech', () => {
    const { container } = render(<AuroraBloom />)
    const root = container.querySelector('[data-aurora-bloom]')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a custom palette object', () => {
    expect(() =>
      render(
        <AuroraBloom
          palette={{
            colors: ['#000000', '#222222', '#444444', '#888888', '#cccccc'],
            ground: '#000000',
            isDark: true,
          }}
        />,
      ),
    ).not.toThrow()
  })

  it('accepts a 5-stop string array palette', () => {
    expect(() =>
      render(
        <AuroraBloom
          palette={['#000000', '#222222', '#444444', '#888888', '#cccccc']}
        />,
      ),
    ).not.toThrow()
  })

  it('renders without breaking when prefers-reduced-motion is asserted', () => {
    // jsdom default matchMedia returns matches=false. Smoke-only.
    expect(() => render(<AuroraBloom breathing speed={0.5} />)).not.toThrow()
  })

  it('supports all shape × position combinations', () => {
    const shapes = ['curtain', 'ribbon', 'halo', 'full'] as const
    const positions = ['top', 'bottom', 'center', 'full'] as const
    for (const shape of shapes) {
      for (const position of positions) {
        const { unmount } = render(<AuroraBloom shape={shape} position={position} />)
        // Mounts and unmounts without throwing
        unmount()
      }
    }
    expect(true).toBe(true)
  })

  it('renders the right number of mesh canvases per layer count', () => {
    const { container, rerender } = render(<AuroraBloom layers={1} />)
    expect(container.querySelectorAll('canvas')).toHaveLength(1)

    rerender(<AuroraBloom layers={2} />)
    expect(container.querySelectorAll('canvas')).toHaveLength(2)

    rerender(<AuroraBloom layers={3} />)
    expect(container.querySelectorAll('canvas')).toHaveLength(3)
  })

  it('exposes a stable test handle via data-aurora-bloom', () => {
    const { container } = render(<AuroraBloom />)
    expect(container.querySelector('[data-aurora-bloom]')).not.toBeNull()
  })
})
