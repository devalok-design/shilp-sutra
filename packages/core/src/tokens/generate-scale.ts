/**
 * OKLCH 12-step scale generator.
 *
 * Generates light + dark palettes from a seed hue and peak chroma.
 * Each step has a defined semantic purpose (see step purposes below).
 * Chroma peaks at step 9 and tapers at the extremes.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScaleOptions {
  /** OKLCH hue angle (0-360) */
  hue: number
  /** Maximum chroma, used at step 9 */
  peakChroma: number
  /** When true, keeps chroma very low across all steps */
  isNeutral?: boolean
}

export interface ScaleStep {
  /** 1-based step number */
  step: number
  /** oklch() CSS value */
  value: string
}

export interface Scale {
  light: ScaleStep[]
  dark: ScaleStep[]
}

// ---------------------------------------------------------------------------
// Constants — lightness values per step
// ---------------------------------------------------------------------------

/** Light-mode lightness: descends from step 1 (brightest) to step 12 (darkest) */
const LIGHT_L: readonly number[] = [
  0.99, // 1  — App background
  0.97, // 2  — Subtle background
  0.93, // 3  — Component bg
  0.89, // 4  — Component bg hover
  0.84, // 5  — Component bg active
  0.78, // 6  — Border subtle
  0.70, // 7  — Border default
  0.62, // 8  — Border strong
  0.55, // 9  — Solid / accent
  0.50, // 10 — Solid hover
  0.43, // 11 — Low-contrast text
  0.32, // 12 — High-contrast text
]

/** Dark-mode lightness: ascends from step 1 (darkest) to step 12 (brightest) */
const DARK_L: readonly number[] = [
  0.14, // 1
  0.17, // 2
  0.21, // 3
  0.25, // 4
  0.30, // 5
  0.36, // 6
  0.44, // 7
  0.53, // 8
  0.63, // 9
  0.58, // 10 — Solid hover: darker than step 9 for visible hover effect
  0.76, // 11
  0.88, // 12
]

// ---------------------------------------------------------------------------
// Constants — chroma weight curves (fraction of peakChroma per step)
// ---------------------------------------------------------------------------

/**
 * Light-mode chroma weights.
 * Derived from the approved token-preview.html pink scale (peakChroma 0.19).
 * Peaks at 1.0 for steps 9-10, tapers at extremes.
 */
const LIGHT_CHROMA_WEIGHTS: readonly number[] = [
  0.005 / 0.19, // 1  ≈ 0.0263
  0.015 / 0.19, // 2  ≈ 0.0789
  0.035 / 0.19, // 3  ≈ 0.1842
  0.055 / 0.19, // 4  ≈ 0.2895
  0.08 / 0.19, // 5  ≈ 0.4211
  0.10 / 0.19, // 6  ≈ 0.5263
  0.14 / 0.19, // 7  ≈ 0.7368
  0.17 / 0.19, // 8  ≈ 0.8947
  1.0, // 9  — peak
  1.0, // 10 — holds peak
  0.14 / 0.19, // 11 ≈ 0.7368
  0.08 / 0.19, // 12 ≈ 0.4211
]

/**
 * Dark-mode chroma weights (fraction of boosted peak = peakChroma * 1.1).
 * Derived from the approved token-preview.html pink dark scale.
 */
const DARK_CHROMA_WEIGHTS: readonly number[] = [
  0.005 / 0.209, // 1  ≈ 0.0239
  0.015 / 0.209, // 2  ≈ 0.0718
  0.04 / 0.209, // 3  ≈ 0.1914
  0.06 / 0.209, // 4  ≈ 0.2871
  0.08 / 0.209, // 5  ≈ 0.3828
  0.10 / 0.209, // 6  ≈ 0.4785
  0.13 / 0.209, // 7  ≈ 0.6220
  0.18 / 0.209, // 8  ≈ 0.8612
  1.0, // 9  — boosted peak
  1.0, // 10 — holds boosted peak
  0.13 / 0.209, // 11 ≈ 0.6220
  0.05 / 0.209, // 12 ≈ 0.2392
]

/** Dark-mode chroma boost multiplier for step 9 */
const DARK_CHROMA_BOOST = 1.1

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Round to N decimal places */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Format a single oklch() CSS value */
function formatOklch(l: number, c: number, h: number): string {
  return `oklch(${round(l, 3)} ${round(c, 4)} ${h})`
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateScale(options: ScaleOptions): Scale {
  const { hue, peakChroma, isNeutral } = options

  if (peakChroma < 0 || peakChroma > 0.4) {
    throw new RangeError(
      `peakChroma must be between 0 and 0.4, got ${peakChroma}`
    )
  }
  if (hue < 0 || hue > 360) {
    throw new RangeError(`hue must be between 0 and 360, got ${hue}`)
  }

  const darkPeak = peakChroma * DARK_CHROMA_BOOST

  const light: ScaleStep[] = []
  const dark: ScaleStep[] = []

  for (let i = 0; i < 12; i++) {
    const step = i + 1

    // Light mode — chroma is always relative to peakChroma
    const lightC = peakChroma * LIGHT_CHROMA_WEIGHTS[i]
    light.push({
      step,
      value: formatOklch(LIGHT_L[i], lightC, hue),
    })

    // Dark mode — neutral scales skip the 1.1x boost
    const darkC = isNeutral
      ? peakChroma * DARK_CHROMA_WEIGHTS[i]
      : darkPeak * DARK_CHROMA_WEIGHTS[i]
    dark.push({
      step,
      value: formatOklch(DARK_L[i], darkC, hue),
    })
  }

  return { light, dark }
}

// ---------------------------------------------------------------------------
// Brand palettes
// ---------------------------------------------------------------------------

export const BRAND_PALETTES = {
  pink: { hue: 360, peakChroma: 0.19 },
  purple: { hue: 300, peakChroma: 0.12 },
  neutral: { hue: 350, peakChroma: 0.01, isNeutral: true },
  red: { hue: 25, peakChroma: 0.18 },
  green: { hue: 145, peakChroma: 0.14 },
  yellow: { hue: 85, peakChroma: 0.14 },
  blue: { hue: 240, peakChroma: 0.12 },
  teal: { hue: 175, peakChroma: 0.10 },
  amber: { hue: 70, peakChroma: 0.12 },
  slate: { hue: 260, peakChroma: 0.04 },
  indigo: { hue: 275, peakChroma: 0.14 },
  cyan: { hue: 210, peakChroma: 0.10 },
  orange: { hue: 50, peakChroma: 0.14 },
  emerald: { hue: 160, peakChroma: 0.12 },
} as const satisfies Record<string, ScaleOptions>
