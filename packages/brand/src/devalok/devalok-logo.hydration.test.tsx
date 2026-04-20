/**
 * Hydration-safety regression test for DevalokLogo.
 *
 * Bug fixed 2026-04-20: the `useState` initializer read
 * `document.documentElement.classList.contains('dark')` on first render.
 * On SSR: document undefined → returned 'brand'. On client hydration: document
 * defined → returned 'white' if dark mode. Mismatch → React threw during
 * hydration in Next.js RSC trees.
 *
 * Fix: deterministic initial state ('brand' for auto-color; actual color for
 * explicit values). A `useLayoutEffect` then swaps to the correct color before
 * the browser paints. Server and first-client-render agree — no hydration error.
 *
 * This test enforces the contract so a future refactor can't silently revert it.
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import * as React from 'react'
import { DevalokLogo, _registerSvg } from './devalok-logo'

const MockSvg = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>((props, ref) => (
  <svg ref={ref} data-testid="mock-svg" {...props}>
    <title>Devalok</title>
  </svg>
))
MockSvg.displayName = 'MockSvg'

beforeEach(() => {
  _registerSvg('wordmark-brand', MockSvg)
  _registerSvg('wordmark-white', MockSvg)
  _registerSvg('wordmark-black', MockSvg)
  document.documentElement.classList.remove('dark')
})

describe('DevalokLogo — hydration safety', () => {
  it('SSR output is deterministic regardless of DOM state when color="auto"', () => {
    // This simulates the RSC case: no document at all. renderToString is a
    // synchronous server render that should NOT touch document.
    const html = renderToString(<DevalokLogo type="monogram" color="auto" />)
    // The initial deterministic state is 'brand'. SSR must emit a brand asset,
    // never 'white' or 'black' — because the client's first pass will also
    // render 'brand' before useLayoutEffect swaps.
    expect(html).toContain('monogram-brand')
    expect(html).not.toContain('monogram-white')
    expect(html).not.toContain('monogram-black')
  })

  it('SSR output for color="auto" does NOT depend on .dark class on html', () => {
    // Even with .dark set (as it would be for a dark-mode consumer), the
    // SERVER must still emit 'brand' — otherwise hydration mismatches when
    // the client's first pass also emits 'brand' deterministically.
    document.documentElement.classList.add('dark')
    const html = renderToString(<DevalokLogo type="monogram" color="auto" />)
    expect(html).toContain('monogram-brand')
    expect(html).not.toContain('monogram-white')
  })

  it('SSR respects explicit color="white"', () => {
    const html = renderToString(<DevalokLogo type="monogram" color="white" />)
    expect(html).toContain('monogram-white')
    expect(html).not.toContain('monogram-brand')
  })

  it('SSR respects explicit color="black"', () => {
    const html = renderToString(<DevalokLogo type="monogram" color="black" />)
    expect(html).toContain('monogram-black')
  })
})
