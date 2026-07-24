/**
 * Brand runtime — apply, persist, and initialize the active brand preset.
 *
 * Applies an OKLCH ramp by overriding --color-accent-1..--color-accent-12
 * (and the dark-mode equivalents) via a <style> tag injected on <html>.
 *
 * Tailwind 4 + the design system read these CSS vars live, so every component
 * recolors instantly with no re-render and no theme provider.
 */
import { BRAND_PRESETS, DEFAULT_BRAND_ID, getPreset } from './brand-presets'
import type { BrandPreset } from './brand-presets'
import { generateRamp } from './ramp-generator'

export const STORAGE_KEY = 'shilp-sutra:brand'
export const STYLE_TAG_ID = 'ss-brand-vars'

/** Sentinel written to STORAGE_KEY when the active brand is a free custom colour. */
export const CUSTOM_BRAND_ID = 'custom'
/** The chosen hex is persisted here so a custom brand survives reloads. */
export const CUSTOM_COLOR_KEY = 'shilp-sutra:custom-color'
/** Injected <style> that carries the custom ramp's CSS vars. */
export const CUSTOM_STYLE_ID = 'ss-custom-brand'
/** Class briefly on <html> so a brand swap tweens instead of flicking. */
export const BRAND_TRANSITION_CLASS = 'brand-transition'
const BRAND_TRANSITION_MS = 340

/**
 * Add the transition class right BEFORE the CSS vars change, so the browser
 * sees `transition` set on the properties whose value is about to move, then
 * strip it once the tween finishes. Debounced across rapid switches.
 */
function flagBrandTransition() {
  if (typeof document === 'undefined') return
  const el = document.documentElement as HTMLElement & { _brandT?: number }
  el.classList.add(BRAND_TRANSITION_CLASS)
  if (el._brandT) window.clearTimeout(el._brandT)
  el._brandT = window.setTimeout(() => {
    el.classList.remove(BRAND_TRANSITION_CLASS)
    el._brandT = undefined
  }, BRAND_TRANSITION_MS)
}

/**
 * Parses the L (lightness, 0–1) channel out of an `oklch(L C H)` string.
 * Returns null if the string doesn't match.
 */
export function readOklchL(value: string): number | null {
  const match = value.match(/oklch\(\s*([0-9.]+)/)
  if (!match) return null
  const l = Number.parseFloat(match[1])
  return Number.isFinite(l) ? l : null
}

/**
 * Auto-tune the foreground colour that sits on top of accent-9 (solid buttons
 * etc.). Light accents get a near-black fg; dark accents get a near-white fg.
 * The crossover is L=0.62 — empirically the boundary at which mid-tone pinks
 * and indigos stop reading well against pure white text.
 */
export function deriveAccentFg(accent9: string): string {
  const l = readOklchL(accent9)
  if (l == null) return 'oklch(0.99 0 0)'
  return l < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
}

export function buildBrandCss(preset: BrandPreset): string {
  const lightVars = preset.ramp.light
    .map((value, i) => `  --color-accent-${i + 1}: ${value};`)
    .join('\n')
  const darkVars = preset.ramp.dark
    .map((value, i) => `  --color-accent-${i + 1}: ${value};`)
    .join('\n')
  const accentFgLight = deriveAccentFg(preset.ramp.light[8])
  const accentFgDark = deriveAccentFg(preset.ramp.dark[8])

  return `:root[data-brand="${preset.id}"] {
${lightVars}
  --color-accent-fg: ${accentFgLight};
}
:root[data-brand="${preset.id}"].dark {
${darkVars}
  --color-accent-fg: ${accentFgDark};
}`
}

/**
 * Aggregate CSS for every shipped preset.
 * Used to inject one stylesheet that covers all brands; switching is then
 * a single attribute change on <html>, not a re-injection.
 */
export function buildAllBrandsCss(): string {
  return BRAND_PRESETS.map(buildBrandCss).join('\n\n')
}

/**
 * Client-side: switch the active brand on <html data-brand="...">.
 * Persists to localStorage so the choice survives navigation.
 */
export function applyBrand(id: string, animate = true) {
  if (typeof document === 'undefined') return
  const preset = getPreset(id) ?? getPreset(DEFAULT_BRAND_ID)
  if (!preset) return
  if (animate) flagBrandTransition()
  document.documentElement.setAttribute('data-brand', preset.id)
  try {
    window.localStorage.setItem(STORAGE_KEY, preset.id)
  } catch {
    // private mode or quota — best-effort persistence
  }
}

export function readPersistedBrand(): string {
  if (typeof window === 'undefined') return DEFAULT_BRAND_ID
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && getPreset(stored)) return stored
  } catch {
    // private mode
  }
  return DEFAULT_BRAND_ID
}

/** "#abc" | "abcdef" → "aabbcc" (lowercase, no hash), or null if not a hex. */
function normalizeHex(hex: string): string | null {
  const m = hex.trim().match(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return h.toLowerCase()
}

/**
 * Derive the two knobs the ramp generator needs (hue + peak chroma) from a
 * plain hex. Hue comes straight from HSL; peak chroma is scaled from HSL
 * saturation and clamped to the in-gamut band the shipped ramps use, so a
 * vivid pick stays vivid and a near-grey pick lands as a quiet near-neutral
 * brand rather than an out-of-gamut smear.
 */
export function hexToBrandParams(hex: string): { hue: number; chroma: number } | null {
  const h = normalizeHex(hex)
  if (!h) return null
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let hue = 0
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6
    else if (max === g) hue = (b - r) / d + 2
    else hue = (r - g) / d + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  const chroma = Math.max(0.03, Math.min(0.2, s * 0.19))
  return { hue: Math.round(hue), chroma: Math.round(chroma * 1000) / 1000 }
}

/**
 * Apply an arbitrary user-picked colour as the active brand. Builds a full
 * 12-step ramp (light + dark) from the hex, injects it under
 * `[data-brand="custom"]`, flips <html> to that brand, and persists the hex.
 * Returns the derived {hue, chroma}, or null if the hex was invalid.
 */
export function applyCustomColor(
  hex: string,
  animate = true,
): { hue: number; chroma: number } | null {
  if (typeof document === 'undefined') return null
  const params = hexToBrandParams(hex)
  if (!params) return null
  if (animate) flagBrandTransition()
  const ramp = generateRamp(params.hue, params.chroma)
  const lightVars = ramp.light.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const darkVars = ramp.dark.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const css = `:root[data-brand="${CUSTOM_BRAND_ID}"] {
${lightVars}
  --color-accent-fg: ${deriveAccentFg(ramp.light[8].value)};
}
:root[data-brand="${CUSTOM_BRAND_ID}"].dark {
${darkVars}
  --color-accent-fg: ${deriveAccentFg(ramp.dark[8].value)};
}`
  let tag = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement | null
  if (!tag) {
    tag = document.createElement('style')
    tag.id = CUSTOM_STYLE_ID
    document.head.appendChild(tag)
  }
  tag.textContent = css
  document.documentElement.setAttribute('data-brand', CUSTOM_BRAND_ID)
  const normalized = normalizeHex(hex)
  try {
    window.localStorage.setItem(STORAGE_KEY, CUSTOM_BRAND_ID)
    if (normalized) window.localStorage.setItem(CUSTOM_COLOR_KEY, `#${normalized}`)
  } catch {
    // private mode or quota — best-effort persistence
  }
  return params
}

/** The persisted custom hex, but only if a custom brand is the active choice. */
export function readPersistedCustomColor(): string | null {
  if (typeof window === 'undefined') return null
  try {
    if (window.localStorage.getItem(STORAGE_KEY) !== CUSTOM_BRAND_ID) return null
    return window.localStorage.getItem(CUSTOM_COLOR_KEY)
  } catch {
    return null
  }
}
