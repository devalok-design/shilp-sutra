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
 *
 * Why pixel-readback instead of just reading `ctx.fillStyle` back:
 * Chrome (148.x at least) accepts `oklch()` as a `fillStyle` setter but its
 * getter returns the input string unchanged ("oklch(0.54 0.209 0)") rather
 * than a normalised "#rrggbb". So we paint a 1x1 fill and read its pixel —
 * which IS rasterised in sRGB regardless of how the canvas reports fillStyle.
 */
export function toHex(color: string): string {
  if (typeof window === 'undefined') return '#000000'
  const ctx = getSampler()
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
 * Read a CSS custom property and coerce to sRGB hex.
 * Returns the fallback if the variable is undefined or unparseable.
 *
 * Approach: build a hidden probe with `background-color: var(<name>)`, let the
 * browser flatten the var() chain through the cascade, then read the COMPUTED
 * background-color (always returned as `rgb(...)` or `rgba(...)` — never a
 * raw `oklch()` or `var()`). That bypasses Safari/older-Chrome quirks where
 * `getPropertyValue` on a custom property returns the textually-declared
 * value (which can still be a `var()` chain) instead of the resolved value.
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
 *
 * Stop selection is theme-aware because the accent ramp is asymmetric:
 *   - LIGHT theme: 1-3 are near-white, 9 is the saturated brand, 11-12 are
 *     deep. We want both light tints (for soft halos) and mid/deep saturation
 *     (for visible color against the white page).
 *   - DARK theme: 1-4 are near-black (just like the page), so feeding them
 *     into the mesh produces a near-black bloom. Only 7-11 carry enough
 *     luminance to read against the dark surface, so we pick from that band.
 */
export function readAuroraPalette(): AuroraPalette {
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const ground = resolveVar('--color-surface-base', isDark ? '#0a0a0a' : '#fafafa')

  if (isDark) {
    // All five stops must out-luminance the page background. Skip 1-6 entirely.
    const a7 = resolveVar('--color-accent-7')
    const a8 = resolveVar('--color-accent-8')
    const a9 = resolveVar('--color-accent-9')
    const a10 = resolveVar('--color-accent-10')
    const a11 = resolveVar('--color-accent-11')
    return {
      // Brand anchor (a9) mid-list so it tends to occupy the visual centre.
      colors: [a7, a9, a11, a10, a8],
      ground,
      isDark,
    }
  }

  // Light theme: keep the soft pale wash but anchor on the saturated core.
  const a3 = resolveVar('--color-accent-3')
  const a5 = resolveVar('--color-accent-5')
  const a7 = resolveVar('--color-accent-7')
  const a9 = resolveVar('--color-accent-9')
  const a11 = resolveVar('--color-accent-11')
  return {
    colors: [a3, a5, a9, a11, a7],
    ground,
    isDark,
  }
}
