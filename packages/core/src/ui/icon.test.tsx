import { IconCheck,IconPlus } from '@tabler/icons-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Icon } from './icon'
import { IconProvider } from './icon-context'

// framer-motion's useReducedMotion returns false in jsdom by default,
// so static-render tests work without extra mocking.

describe('Icon', () => {
  // ── Size tiers ─────────────────────────────────────────────────────────────
  it.each([
    ['xs', 14],
    ['sm', 16],
    ['md', 18],
    ['lg', 20],
    ['xl', 24],
    ['2xl', 32],
  ] as const)('renders size=%s with %dpx', (size, px) => {
    render(<Icon icon={IconPlus} size={size} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', String(px))
    expect(svg).toHaveAttribute('height', String(px))
  })

  it('defaults to size=md (18px)', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '18')
  })

  // ── Stroke weights ─────────────────────────────────────────────────────────
  // Tabler icons keep stroke="currentColor" on the <svg> root.
  // Our Icon component passes the numeric strokeWidth via the `stroke` prop
  // to the Tabler component, which renders it as the `stroke-width` SVG attr.
  it.each([
    ['light', '1.5'],
    ['regular', '2'],
    ['bold', '2.5'],
  ] as const)('renders stroke=%s at md size', (stroke, expectedWidth) => {
    render(<Icon icon={IconPlus} stroke={stroke} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('stroke-width', expectedWidth)
  })

  // ── Accessible label ───────────────────────────────────────────────────────
  it('renders with role="img" and aria-label when label is provided', () => {
    render(<Icon icon={IconPlus} label="Add item" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', 'Add item')
  })

  it('renders aria-hidden when no label is provided', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  // ── IconContext inheritance ─────────────────────────────────────────────────
  it('reads size from IconProvider context', () => {
    render(
      <IconProvider size="xl">
        <Icon icon={IconPlus} />
      </IconProvider>,
    )
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
  })

  it('explicit size prop overrides context', () => {
    render(
      <IconProvider size="xl">
        <Icon icon={IconPlus} size="xs" />
      </IconProvider>,
    )
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '14')
  })

  // ── Animation presets (structural — we just verify the wrapper renders) ────
  it('wraps in motion.span for spin animation', () => {
    const { container } = render(<Icon icon={IconPlus} animate="spin" />)
    // Animated icons get wrapped in a span.inline-flex
    const wrapper = container.querySelector('span.inline-flex')
    expect(wrapper).toBeInTheDocument()
  })

  it('wraps in motion.span for pulse animation', () => {
    const { container } = render(<Icon icon={IconPlus} animate="pulse" />)
    const wrapper = container.querySelector('span.inline-flex')
    expect(wrapper).toBeInTheDocument()
  })

  it('wraps in motion.span for bounce animation', () => {
    const { container } = render(<Icon icon={IconPlus} animate="bounce" />)
    const wrapper = container.querySelector('span.inline-flex')
    expect(wrapper).toBeInTheDocument()
  })

  it('does not wrap when animate="none"', () => {
    const { container } = render(<Icon icon={IconPlus} animate="none" />)
    const wrapper = container.querySelector('span.inline-flex')
    expect(wrapper).not.toBeInTheDocument()
  })

  // ── State machine ──────────────────────────────────────────────────────────
  it('renders spinner when state="loading"', () => {
    render(<Icon icon={IconPlus} state="loading" />)
    // Spinner component renders role="status"
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('state takes priority over animate', () => {
    render(<Icon icon={IconPlus} state="loading" animate="bounce" />)
    // Should show spinner, not the bounce animation
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders normal icon when state="idle"', () => {
    render(<Icon icon={IconPlus} state="idle" />)
    // Should render the SVG directly, not a spinner
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  // ── a11y ───────────────────────────────────────────────────────────────────
  it('has no a11y violations (with label)', async () => {
    const { container } = render(<Icon icon={IconPlus} label="Add item" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations (decorative)', async () => {
    const { container } = render(<Icon icon={IconPlus} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
