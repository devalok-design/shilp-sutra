'use client'

import * as React from 'react'

/**
 * Live, theme- and brand-reactive palette resolver for {@link AuroraBloom}
 * and any custom WebGL/canvas composition built on the design tokens.
 *
 * The accent ramp is asymmetric:
 *   - LIGHT theme: 1-3 are near-white, 9 is the saturated brand, 11-12 deep.
 *   - DARK  theme: 1-4 are near-black (just like the page), so feeding them
 *     into a WebGL mesh produces a near-black bloom. Only 7-11 carry enough
 *     luminance to read against a dark surface.
 *
 * This module exports:
 *   - {@link readAuroraPalette} — one-shot read, useful in `useEffect`.
 *   - {@link useAuroraPalette}  — live React hook that re-resolves on
 *     `data-brand`, `.dark`, or inline-style mutations of `<html>`.
 *   - {@link toHex} / {@link resolveVar} — primitives if you need to build
 *     your own palette shape.
 */

export interface AuroraPalette {
  /** 5 sRGB hex stops, drawn from the live brand ramp. Ordered for a mesh
   *  shader where the mid-list color tends to dominate the visual centre. */
  colors: string[]
  /** sRGB hex of `--color-surface-base` — the page color. Used by callers
   *  for inner-fill or bottom-fade composition so the bloom blends cleanly
   *  into the page background. */
  ground: string
  /** True when `<html>` carries the `.dark` class. */
  isDark: boolean
}

/* ─── sRGB conversion (canvas pixel-readback) ──────────────────────────── */

let _sampler: HTMLCanvasElement | null = null

function getSampler(): CanvasRenderingContext2D | null {
  if (!_sampler) {
    _sampler = document.createElement('canvas')
    _sampler.width = 1
    _sampler.height = 1
  }
  // jsdom returns null here — keep the resolver functional in tests by
  // letting callers fall back to the safe default.
  return _sampler.getContext('2d', { willReadFrequently: true })
}

/**
 * Coerce any CSS color (including `oklch(...)`, `var(--x)`, named colors)
 * into a sRGB hex string `#rrggbb`. Returns `#000000` if unparseable.
 *
 * Why pixel-readback instead of just reading `ctx.fillStyle` back:
 * Chrome 148.x accepts `oklch()` as a `fillStyle` setter but its getter
 * returns the input string unchanged ("oklch(0.54 0.209 0)") rather than a
 * normalised "#rrggbb". So we paint a 1x1 fill and read its pixel — which
 * IS rasterised in sRGB regardless of how the canvas reports fillStyle.
 */
export function toHex(color: string): string {
  if (typeof window === 'undefined') return '#000000'
  const ctx = getSampler()
  if (!ctx) return '#000000'
  ctx.clearRect(0, 0, 1, 1)
  try {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
  } catch {
    return '#000000'
  }
  try {
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    const r = pixel[0].toString(16).padStart(2, '0')
    const g = pixel[1].toString(16).padStart(2, '0')
    const b = pixel[2].toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  } catch {
    return '#000000'
  }
}

/**
 * Read a CSS custom property off `<html>` (via a hidden probe) and coerce
 * the result to sRGB hex. Returns the fallback if the variable is undefined.
 *
 * The hidden probe pattern flattens any `var()` chain through the cascade,
 * which means consumers can pass token names like `--color-accent-9` even
 * though those tokens internally resolve to `var(--pink-9)`.
 */
export function resolveVar(name: string, fallback = '#000000'): string {
  if (typeof window === 'undefined') return fallback
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;background-color:var(${name});`
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).backgroundColor
  document.body.removeChild(probe)
  if (!computed || computed === 'rgba(0, 0, 0, 0)') return fallback
  return toHex(computed)
}

/* ─── high-level palette resolver ──────────────────────────────────────── */

/**
 * Resolve the live brand ramp into a 5-stop aurora palette. Stop selection
 * is theme-aware (see module docstring).
 */
export function readAuroraPalette(): AuroraPalette {
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const ground = resolveVar('--color-surface-base', isDark ? '#0a0a0a' : '#fafafa')

  if (isDark) {
    const a7 = resolveVar('--color-accent-7')
    const a8 = resolveVar('--color-accent-8')
    const a9 = resolveVar('--color-accent-9')
    const a10 = resolveVar('--color-accent-10')
    const a11 = resolveVar('--color-accent-11')
    // Brand anchor (a9) mid-list so it tends to occupy the visual centre.
    return { colors: [a7, a9, a11, a10, a8], ground, isDark }
  }

  const a3 = resolveVar('--color-accent-3')
  const a5 = resolveVar('--color-accent-5')
  const a7 = resolveVar('--color-accent-7')
  const a9 = resolveVar('--color-accent-9')
  const a11 = resolveVar('--color-accent-11')
  return { colors: [a3, a5, a9, a11, a7], ground, isDark }
}

/**
 * Live, theme- and brand-reactive aurora palette. Re-resolves whenever the
 * `.dark` class, `data-brand` attribute, or inline `style` of `<html>` is
 * mutated — covering both the design system's own theme/brand switcher and
 * any consumer-owned mechanism that writes accent CSS variables at runtime.
 *
 * Returns a stable {@link AuroraPalette} that callers can pass directly into
 * `AuroraBloom`, a Paper Shaders MeshGradient, or any other token-driven
 * canvas/WebGL composition.
 *
 * @example
 * const palette = useAuroraPalette()
 * return <MeshGradient colors={palette.colors} ... />
 */
export function useAuroraPalette(): AuroraPalette {
  const isClient = typeof window !== 'undefined'
  const [palette, setPalette] = React.useState<AuroraPalette>(() => {
    if (!isClient) {
      return {
        colors: ['#fafafa', '#fce8ef', '#e58fb0', '#a23f6a', '#c66b8e'],
        ground: '#fafafa',
        isDark: false,
      }
    }
    return readAuroraPalette()
  })

  React.useEffect(() => {
    if (!isClient) return
    setPalette(readAuroraPalette())

    let pending = 0
    const schedule = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        setPalette(readAuroraPalette())
      }, 50)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-brand', 'style'],
    })
    return () => {
      observer.disconnect()
      window.clearTimeout(pending)
    }
  }, [isClient])

  return palette
}
