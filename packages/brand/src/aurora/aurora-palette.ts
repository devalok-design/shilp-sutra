'use client'

import * as React from 'react'

/**
 * Live, theme- and brand-reactive palette resolver for {@link AuroraBloom}
 * and any custom WebGL/canvas composition built on the design tokens.
 *
 * Reads the live accent ramp straight from the CSS cascade, so it carries no
 * token payload of its own — the consuming app supplies the tokens (via
 * `@devalok/shilp-sutra/css`) and this resolver reflects whatever brand /
 * theme is active. That keeps `@devalok/shilp-sutra-brand` an identity-only
 * package with no dependency on core.
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

/** Safe default used on the server and before the first client resolve. A
 *  neutral Devalok-pink wash — recoloured the instant the client resolves the
 *  real ramp. Shared by the hook's initial state and {@link FALLBACK_PALETTE}. */
export const DEFAULT_PALETTE: AuroraPalette = {
  colors: ['#fafafa', '#fce8ef', '#e58fb0', '#a23f6a', '#c66b8e'],
  ground: '#fafafa',
  isDark: false,
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

/* ─── CSS variable resolver (single persistent probe) ──────────────────── */

// Distinct colour-valued properties. Packing one var per property onto a
// single probe lets us read N variables with ONE forced reflow instead of N
// (previously each var appended + removed its own probe div = 2 reflows each).
const COLOR_PROPS = [
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'column-rule-color',
] as const

const PROBE_BASE =
  'position:absolute;left:-9999px;top:-9999px;width:0;height:0;pointer-events:none;'

let _probe: HTMLDivElement | null = null

function getProbe(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null
  if (!_probe || !_probe.isConnected) {
    _probe = document.createElement('div')
    _probe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(_probe)
  }
  return _probe
}

/**
 * Resolve several CSS custom properties to sRGB hex in a single reflow.
 *
 * Each name is applied to a distinct colour property with a `transparent`
 * fallback, so an undefined variable resolves to `rgba(0, 0, 0, 0)` and we
 * substitute {@link fallback} — matching {@link resolveVar}'s semantics for
 * every property (not just `background-color`).
 */
export function resolveVars(names: string[], fallback = '#000000'): string[] {
  if (typeof window === 'undefined') return names.map(() => fallback)
  if (names.length > COLOR_PROPS.length) {
    throw new Error(
      `resolveVars: at most ${COLOR_PROPS.length} variables per call (got ${names.length})`,
    )
  }
  const probe = getProbe()
  if (!probe) return names.map(() => fallback)

  let css = PROBE_BASE
  names.forEach((name, i) => {
    css += `${COLOR_PROPS[i]}:var(${name}, transparent);`
  })
  probe.style.cssText = css

  const computed = getComputedStyle(probe)
  return names.map((_, i) => {
    const value = computed.getPropertyValue(COLOR_PROPS[i]).trim()
    if (!value || value === 'rgba(0, 0, 0, 0)' || value === 'transparent') {
      return fallback
    }
    return toHex(value)
  })
}

/**
 * Read a single CSS custom property off `<html>` (via the shared probe) and
 * coerce the result to sRGB hex. Returns the fallback if the variable is
 * undefined.
 *
 * The probe pattern flattens any `var()` chain through the cascade, which
 * means consumers can pass token names like `--color-accent-9` even though
 * those tokens internally resolve to `var(--pink-9)`.
 */
export function resolveVar(name: string, fallback = '#000000'): string {
  return resolveVars([name], fallback)[0]
}

/* ─── high-level palette resolver ──────────────────────────────────────── */

/**
 * Resolve the live brand ramp into a 5-stop aurora palette. Stop selection
 * is theme-aware (see module docstring). All stops for the active theme are
 * read in a single batched reflow.
 */
export function readAuroraPalette(): AuroraPalette {
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  if (isDark) {
    // ground + accent 7,8,9,10,11
    const [ground, a7, a8, a9, a10, a11] = resolveVars(
      [
        '--color-surface-base',
        '--color-accent-7',
        '--color-accent-8',
        '--color-accent-9',
        '--color-accent-10',
        '--color-accent-11',
      ],
      '#0a0a0a',
    )
    // Brand anchor (a9) mid-list so it tends to occupy the visual centre.
    return { colors: [a7, a9, a11, a10, a8], ground, isDark }
  }

  // ground + accent 3,5,7,9,11
  const [ground, a3, a5, a7, a9, a11] = resolveVars(
    [
      '--color-surface-base',
      '--color-accent-3',
      '--color-accent-5',
      '--color-accent-7',
      '--color-accent-9',
      '--color-accent-11',
    ],
    '#fafafa',
  )
  return { colors: [a3, a5, a9, a11, a7], ground, isDark }
}

/** Stable string identity of a palette — used to skip no-op re-renders. */
export function paletteKey(p: AuroraPalette): string {
  return `${p.isDark ? 'd' : 'l'}|${p.colors.join(',')}|${p.ground}`
}

/**
 * Live, theme- and brand-reactive aurora palette. Re-resolves whenever the
 * `.dark` class, `data-brand` attribute, or inline `style` of `<html>` is
 * mutated — covering both the design system's own theme/brand switcher and
 * any consumer-owned mechanism that writes accent CSS variables at runtime.
 *
 * Unrelated `<html>` style mutations (e.g. a scroll-driven inline var) resolve
 * to the same ramp, so the hook compares the resolved signature and only
 * updates state when the palette actually changed — no wasted re-renders.
 *
 * @example
 * const palette = useAuroraPalette()
 * return <MeshGradient colors={palette.colors} ... />
 */
export function useAuroraPalette(): AuroraPalette {
  const isClient = typeof window !== 'undefined'
  const [palette, setPalette] = React.useState<AuroraPalette>(() =>
    isClient ? readAuroraPalette() : DEFAULT_PALETTE,
  )
  const keyRef = React.useRef<string>(paletteKey(palette))

  React.useEffect(() => {
    if (!isClient) return

    const resolve = () => {
      const next = readAuroraPalette()
      const nextKey = paletteKey(next)
      if (nextKey === keyRef.current) return // unchanged ramp — skip re-render
      keyRef.current = nextKey
      setPalette(next)
    }

    resolve()

    let pending = 0
    const schedule = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(resolve, 50)
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
