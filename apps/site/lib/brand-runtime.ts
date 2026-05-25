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

export const STORAGE_KEY = 'shilp-sutra:brand'
export const STYLE_TAG_ID = 'ss-brand-vars'

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
export function applyBrand(id: string) {
  if (typeof document === 'undefined') return
  const preset = getPreset(id) ?? getPreset(DEFAULT_BRAND_ID)
  if (!preset) return
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
