/**
 * Aurora palette resolver.
 *
 * Paper Shaders only parses `#hex`, `rgb()`, `hsl()` — our tokens are `oklch()`.
 * We use a canvas 2D context to coerce any CSS color the browser knows into
 * the sRGB hex Paper accepts. Same trick Tailwind 4 uses internally.
 *
 * The aurora reads four stops from the live brand ramp + the page surface
 * color so the mesh blends into the page edges instead of clipping hard.
 *
 * Stops chosen for tonal richness within a single hue:
 *   accent-4  → pale wash (light edges of the bloom)
 *   accent-7  → mid tone (body of the curtain)
 *   accent-9  → brand anchor (the saturated core)
 *   accent-11 → deep tone (shadow of the curtain, dark-mode highlight)
 *   surface-base → ground (so mesh fades into the page, not a hard rectangle)
 */

const SAMPLER_VAR_NAME = '--aurora-color-sampler'

let _sampler: HTMLCanvasElement | null = null

function getSampler(): CanvasRenderingContext2D {
  if (!_sampler) {
    _sampler = document.createElement('canvas')
    _sampler.width = 1
    _sampler.height = 1
  }
  const ctx = _sampler.getContext('2d')
  if (!ctx) throw new Error('aurora: 2D canvas unavailable')
  return ctx
}

/**
 * Coerce any CSS color (including `oklch(...)`, `var(--x)`, named colors) into
 * a sRGB hex string `#rrggbb`. Returns `#000000` if the input is unparseable.
 */
export function toHex(color: string): string {
  if (typeof window === 'undefined') return '#000000'
  const ctx = getSampler()
  ctx.fillStyle = '#000000'
  try {
    ctx.fillStyle = color
  } catch {
    return '#000000'
  }
  const out = ctx.fillStyle
  // Canvas normalises to `#rrggbb` for opaque colors, or `rgba(...)` for alpha.
  // Strip alpha — aurora doesn't want transparent stops.
  if (typeof out === 'string' && out.startsWith('#')) return out
  if (typeof out === 'string' && out.startsWith('rgba')) {
    const m = out.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) {
      const r = Number(m[1]).toString(16).padStart(2, '0')
      const g = Number(m[2]).toString(16).padStart(2, '0')
      const b = Number(m[3]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
  }
  return '#000000'
}

/**
 * Read a CSS custom property off `<html>` and coerce to sRGB hex.
 * Returns the fallback if the variable is undefined or unparseable.
 */
export function resolveVar(name: string, fallback = '#000000'): string {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return fallback
  // CSS var values can themselves be `var(...)` chains — wrap into a temp
  // element and let the browser flatten before sampling.
  const probe = document.createElement('span')
  probe.style.setProperty(SAMPLER_VAR_NAME, raw)
  probe.style.color = `var(${SAMPLER_VAR_NAME})`
  probe.style.position = 'absolute'
  probe.style.opacity = '0'
  probe.style.pointerEvents = 'none'
  document.body.appendChild(probe)
  const flattened = getComputedStyle(probe).color
  document.body.removeChild(probe)
  return toHex(flattened || raw)
}

export interface AuroraPalette {
  /** 5 hex stops for MeshGradient u_colors */
  colors: string[]
  /** sRGB hex of `--color-surface-base` — used for the bottom-fade mask */
  ground: string
  /** True if `<html>` has the `.dark` class */
  isDark: boolean
}

/**
 * Resolve the live brand ramp into a 5-stop aurora palette.
 * Re-call whenever `data-brand`, `class` on `<html>`, or `:root` styles change.
 */
export function readAuroraPalette(): AuroraPalette {
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const ground = resolveVar('--color-surface-base', isDark ? '#0a0a0a' : '#fafafa')
  const a4 = resolveVar('--color-accent-4')
  const a7 = resolveVar('--color-accent-7')
  const a9 = resolveVar('--color-accent-9')
  const a11 = resolveVar('--color-accent-11')

  // Order: ground → light → mid → core → deep
  // Mesh shader treats stops as orbiting spots; the order shifts which color
  // tends to occupy the "center" of the bloom. We want the brand anchor (a9)
  // toward the middle of the list so it dominates visually.
  return {
    colors: [ground, a4, a9, a11, a7],
    ground,
    isDark,
  }
}
