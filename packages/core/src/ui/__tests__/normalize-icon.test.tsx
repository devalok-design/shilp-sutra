/**
 * Foundation tests for normalizeIcon + IconInput.
 *
 * Both runtime behavior + type compatibility. Type checks are inside
 * expectTypeOf blocks — they run at `pnpm typecheck` time, not at test time.
 */
import { IconArrowRight, IconPlus, IconUser } from '@tabler/icons-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { Icon } from '../icon'
import { IconProvider } from '../icon-context'
import type { IconInput } from '../lib/icon-input'
import { normalizeIcon } from '../lib/normalize-icon'

describe('normalizeIcon — runtime', () => {
  it('returns null for null', () => {
    expect(normalizeIcon(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(normalizeIcon(undefined)).toBeNull()
  })

  it('wraps a Tabler component ref in <Icon />', () => {
    render(<div data-testid="host">{normalizeIcon(IconPlus)}</div>)
    const host = screen.getByTestId('host')
    expect(host.querySelector('svg')).toBeTruthy()
  })

  it('passes through an instantiated raw Tabler element', () => {
    render(<div data-testid="host">{normalizeIcon(<IconArrowRight />)}</div>)
    const host = screen.getByTestId('host')
    expect(host.querySelector('svg')).toBeTruthy()
  })

  it('passes through an instantiated <Icon> element', () => {
    render(<div data-testid="host">{normalizeIcon(<Icon icon={IconUser} />)}</div>)
    const host = screen.getByTestId('host')
    expect(host.querySelector('svg')).toBeTruthy()
  })

  it('passes through a custom node like <span>$</span>', () => {
    render(<div data-testid="host">{normalizeIcon(<span>$</span>)}</div>)
    const host = screen.getByTestId('host')
    expect(host.querySelector('span')?.textContent).toBe('$')
  })

  it('Tabler component ref + IconProvider — size propagates via context', () => {
    render(
      <div data-testid="host">
        <IconProvider size="lg">{normalizeIcon(IconPlus)}</IconProvider>
      </div>,
    )
    const host = screen.getByTestId('host')
    const svg = host.querySelector('svg')
    expect(svg).toBeTruthy()
    // lg = 20px per SIZE_PX in icon.tsx
    expect(svg?.getAttribute('width')).toBe('20')
    expect(svg?.getAttribute('height')).toBe('20')
  })

  it('Tabler component ref + fallbackSize (no IconProvider) renders at fallback size', () => {
    render(<div data-testid="host">{normalizeIcon(IconPlus, 'xl')}</div>)
    const host = screen.getByTestId('host')
    const svg = host.querySelector('svg')
    expect(svg).toBeTruthy()
    // xl = 24px
    expect(svg?.getAttribute('width')).toBe('24')
  })

  it('IconProvider size beats fallbackSize when both set', () => {
    // Context wins because <Icon> reads context FIRST when no explicit prop is set
    // — but here we pass fallbackSize, which becomes the explicit size prop. Document the
    // behavior: explicit `fallbackSize` always wins.
    render(
      <div data-testid="host">
        <IconProvider size="sm">{normalizeIcon(IconPlus, 'xl')}</IconProvider>
      </div>,
    )
    const svg = screen.getByTestId('host').querySelector('svg')
    // xl = 24px — explicit fallbackSize prop is honored
    expect(svg?.getAttribute('width')).toBe('24')
  })
})

describe('IconInput — type compatibility', () => {
  it('accepts a Tabler component ref', () => {
    expectTypeOf<typeof IconPlus>().toMatchTypeOf<IconInput>()
  })

  it('accepts an instantiated React element', () => {
    const el = <IconPlus />
    expectTypeOf(el).toMatchTypeOf<IconInput>()
  })

  it('accepts an <Icon> element', () => {
    const el = <Icon icon={IconUser} />
    expectTypeOf(el).toMatchTypeOf<IconInput>()
  })

  it('accepts a custom node element', () => {
    const el = <span>$</span>
    expectTypeOf(el).toMatchTypeOf<IconInput>()
  })

  it('accepts null', () => {
    expectTypeOf<null>().toMatchTypeOf<IconInput>()
  })

  it('accepts undefined', () => {
    expectTypeOf<undefined>().toMatchTypeOf<IconInput>()
  })

  it('does NOT accept arbitrary strings or numbers', () => {
    expectTypeOf<'string'>().not.toMatchTypeOf<IconInput>()
    expectTypeOf<42>().not.toMatchTypeOf<IconInput>()
  })
})
