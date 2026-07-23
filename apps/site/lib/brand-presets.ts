/**
 * Brand presets — proof that shilp-sutra recolors cleanly.
 *
 * The chrome switcher offers preset brands and a "Custom →" link to /theming.
 * Each preset is a full 12-step OKLCH ramp (light + dark) that overrides
 * `--color-accent-1` through `--color-accent-12`. `--color-accent-fg` is
 * auto-tuned from accent-9 lightness at apply time (see brand-runtime).
 *
 * Shilp Sutra teal is the default — the site's own brand identity (H:188).
 * Devalok pink, Indigo, and Sage remain selectable for anyone who wants them.
 *
 * Adding a preset:
 *  1. Pick a hue. Keep H consistent across light + dark.
 *  2. Mirror the L curve used here — chroma should be fit to what the hue can
 *     actually reach in-gamut (teal's chroma ceiling is much lower than
 *     pink's; don't just uniformly scale another preset's C values).
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
 * Shilp Sutra — the product's own teal identity (H:188).
 * Chroma is NOT a uniform scale of Devalok's curve — it's fit from the
 * actual brand-palette swatches (Figma node 103:1155), since teal's in-gamut
 * chroma ceiling peaks around L 0.7-0.78 and falls off in both directions,
 * unlike pink's monotonic rise to a step-9/10 peak. Same L curve as every
 * other preset, so accent-fg auto-tune behaves identically.
 */
const SHILP_SUTRA: BrandPreset = {
  id: 'shilp-sutra',
  name: 'Shilp Sutra',
  description: 'Studio teal',
  origin: "The product's own brand identity.",
  hue: 188,
  ramp: {
    light: [
      'oklch(0.99 0.004 188)',
      'oklch(0.97 0.007 188)',
      'oklch(0.93 0.028 188)',
      'oklch(0.89 0.055 188)',
      'oklch(0.84 0.088 188)',
      'oklch(0.78 0.112 188)',
      'oklch(0.7 0.115 188)',
      'oklch(0.62 0.105 188)',
      'oklch(0.55 0.096 188)',
      'oklch(0.5 0.087 188)',
      'oklch(0.43 0.075 188)',
      'oklch(0.32 0.053 188)',
    ],
    dark: [
      'oklch(0.11 0.004 188)',
      'oklch(0.17 0.007 188)',
      'oklch(0.23 0.032 188)',
      'oklch(0.29 0.06 188)',
      'oklch(0.34 0.088 188)',
      'oklch(0.38 0.112 188)',
      'oklch(0.44 0.107 188)',
      'oklch(0.53 0.111 188)',
      'oklch(0.54 0.106 188)',
      'oklch(0.49 0.096 188)',
      'oklch(0.76 0.07 188)',
      'oklch(0.88 0.033 188)',
    ],
  },
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

export const BRAND_PRESETS: BrandPreset[] = [SHILP_SUTRA, DEVALOK, INDIGO, SAGE]
export const DEFAULT_BRAND_ID = 'shilp-sutra'

export function getPreset(id: string): BrandPreset | undefined {
  return BRAND_PRESETS.find((p) => p.id === id)
}
