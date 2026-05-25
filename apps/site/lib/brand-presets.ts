/**
 * Brand presets — proof that shilp-sutra recolors cleanly.
 *
 * The chrome switcher offers two preset brands and a "Custom →" link to /theming.
 * Each preset is a full 12-step OKLCH ramp (light + dark) that overrides
 * `--color-accent-1` through `--color-accent-12`. `--color-accent-fg` is
 * auto-tuned from accent-9 lightness at apply time (see brand-runtime).
 *
 * Devalok is the default — it mirrors shilp-sutra's own Blooming Lotus pink
 * (H:360) verbatim, so picking "Devalok" is a no-op visually.
 *
 * Adding a preset:
 *  1. Pick a hue. Keep H consistent across light + dark.
 *  2. Mirror the L and C curves used here (or run packages/core/src/tokens/generate-scale.ts).
 *  3. Verify accent-9 in light mode has L between 0.50 and 0.62 so accent-fg auto-tune flips correctly.
 */

export type Oklch = string

export type BrandRamp = {
  light: [Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch]
  dark: [Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch, Oklch]
}

export type BrandPreset = {
  id: string
  name: string
  description: string
  /** Cultural reference for the name choice — surfaces in the dropdown */
  origin: string
  /** Single hue used across the whole ramp */
  hue: number
  ramp: BrandRamp
}

/**
 * Devalok — Blooming Lotus pink (H:360).
 * Verbatim copy of shilp-sutra's stock accent ramp. Used as the default brand.
 */
const DEVALOK: BrandPreset = {
  id: 'devalok',
  name: 'Devalok',
  description: 'Blooming Lotus pink',
  origin: 'Devalok house brand',
  hue: 360,
  ramp: {
    light: [
      'oklch(0.99 0.005 360)',
      'oklch(0.97 0.015 360)',
      'oklch(0.93 0.035 360)',
      'oklch(0.89 0.055 360)',
      'oklch(0.84 0.08 360)',
      'oklch(0.78 0.1 360)',
      'oklch(0.7 0.14 360)',
      'oklch(0.62 0.17 360)',
      'oklch(0.55 0.19 360)',
      'oklch(0.5 0.19 360)',
      'oklch(0.43 0.14 360)',
      'oklch(0.32 0.08 360)',
    ],
    dark: [
      'oklch(0.11 0.005 360)',
      'oklch(0.17 0.015 360)',
      'oklch(0.23 0.04 360)',
      'oklch(0.29 0.06 360)',
      'oklch(0.34 0.08 360)',
      'oklch(0.38 0.1 360)',
      'oklch(0.44 0.13 360)',
      'oklch(0.53 0.18 360)',
      'oklch(0.54 0.209 360)',
      'oklch(0.49 0.209 360)',
      'oklch(0.76 0.13 360)',
      'oklch(0.88 0.05 360)',
    ],
  },
}

/**
 * Indigo — Nilakantha indigo (H:265).
 * Cool, sober, B2B-leaning. Proof that shilp-sutra works without warmth.
 */
const INDIGO: BrandPreset = {
  id: 'indigo',
  name: 'Indigo',
  description: 'Nilakantha indigo',
  origin: 'Named for the throat of Shiva — the colour of held poison.',
  hue: 265,
  ramp: {
    light: [
      'oklch(0.99 0.005 265)',
      'oklch(0.97 0.015 265)',
      'oklch(0.93 0.035 265)',
      'oklch(0.89 0.055 265)',
      'oklch(0.84 0.08 265)',
      'oklch(0.78 0.1 265)',
      'oklch(0.7 0.14 265)',
      'oklch(0.62 0.17 265)',
      'oklch(0.55 0.19 265)',
      'oklch(0.5 0.19 265)',
      'oklch(0.43 0.14 265)',
      'oklch(0.32 0.08 265)',
    ],
    dark: [
      'oklch(0.11 0.005 265)',
      'oklch(0.17 0.015 265)',
      'oklch(0.23 0.04 265)',
      'oklch(0.29 0.06 265)',
      'oklch(0.34 0.08 265)',
      'oklch(0.38 0.1 265)',
      'oklch(0.44 0.13 265)',
      'oklch(0.53 0.18 265)',
      'oklch(0.54 0.209 265)',
      'oklch(0.49 0.209 265)',
      'oklch(0.76 0.13 265)',
      'oklch(0.88 0.05 265)',
    ],
  },
}

/**
 * Sage — Tulsi sage (H:155).
 * Muted, herbal, low-chroma. Used by editorial / publishing / quiet brands.
 */
const SAGE: BrandPreset = {
  id: 'sage',
  name: 'Sage',
  description: 'Tulsi sage',
  origin: 'Named for the holy basil — a quiet, daily presence in every Indian home.',
  hue: 155,
  ramp: {
    light: [
      'oklch(0.99 0.004 155)',
      'oklch(0.97 0.012 155)',
      'oklch(0.93 0.028 155)',
      'oklch(0.89 0.044 155)',
      'oklch(0.84 0.064 155)',
      'oklch(0.78 0.08 155)',
      'oklch(0.7 0.105 155)',
      'oklch(0.62 0.125 155)',
      'oklch(0.55 0.14 155)',
      'oklch(0.5 0.14 155)',
      'oklch(0.43 0.1 155)',
      'oklch(0.32 0.06 155)',
    ],
    dark: [
      'oklch(0.11 0.004 155)',
      'oklch(0.17 0.012 155)',
      'oklch(0.23 0.03 155)',
      'oklch(0.29 0.046 155)',
      'oklch(0.34 0.06 155)',
      'oklch(0.38 0.075 155)',
      'oklch(0.44 0.097 155)',
      'oklch(0.53 0.13 155)',
      'oklch(0.54 0.15 155)',
      'oklch(0.49 0.15 155)',
      'oklch(0.76 0.095 155)',
      'oklch(0.88 0.04 155)',
    ],
  },
}

export const BRAND_PRESETS: BrandPreset[] = [DEVALOK, INDIGO, SAGE]
export const DEFAULT_BRAND_ID = 'devalok'

export function getPreset(id: string): BrandPreset | undefined {
  return BRAND_PRESETS.find((p) => p.id === id)
}
