/**
 * OKLCH 12-step ramp generator for the site's /theming page.
 *
 * Ported from `packages/core/src/tokens/generate-scale.ts` so the editor
 * produces ramps identical to the ones shilp-sutra ships with. The DS
 * function is not exported on a public path; copying the table-driven
 * algorithm here keeps the site independent of DS-internal API changes.
 *
 * Keep in sync with the source. If the DS algorithm changes, mirror it
 * here in the same PR.
 */

export interface RampStep {
  step: number
  value: string
}

export interface Ramp {
  light: RampStep[]
  dark: RampStep[]
}

const LIGHT_L = [0.99, 0.97, 0.93, 0.89, 0.84, 0.78, 0.7, 0.62, 0.55, 0.5, 0.43, 0.32] as const
const DARK_L = [0.11, 0.17, 0.23, 0.29, 0.34, 0.38, 0.44, 0.53, 0.63, 0.58, 0.76, 0.88] as const

const LIGHT_CHROMA_W = [
  0.005 / 0.19,
  0.015 / 0.19,
  0.035 / 0.19,
  0.055 / 0.19,
  0.08 / 0.19,
  0.1 / 0.19,
  0.14 / 0.19,
  0.17 / 0.19,
  1,
  1,
  0.14 / 0.19,
  0.08 / 0.19,
] as const

const DARK_CHROMA_W = [
  0.005 / 0.209,
  0.015 / 0.209,
  0.04 / 0.209,
  0.06 / 0.209,
  0.08 / 0.209,
  0.1 / 0.209,
  0.13 / 0.209,
  0.18 / 0.209,
  1,
  1,
  0.13 / 0.209,
  0.05 / 0.209,
] as const

const DARK_BOOST = 1.1

const round = (n: number, d: number) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

const oklch = (l: number, c: number, h: number) => `oklch(${round(l, 3)} ${round(c, 4)} ${h})`

export function generateRamp(hue: number, peakChroma: number): Ramp {
  const light: RampStep[] = []
  const dark: RampStep[] = []
  const darkPeak = peakChroma * DARK_BOOST
  for (let i = 0; i < 12; i++) {
    light.push({ step: i + 1, value: oklch(LIGHT_L[i], peakChroma * LIGHT_CHROMA_W[i], hue) })
    dark.push({ step: i + 1, value: oklch(DARK_L[i], darkPeak * DARK_CHROMA_W[i], hue) })
  }
  return { light, dark }
}

/**
 * Same lightness heuristic used by brand-runtime: light accents take a
 * near-black foreground, dark accents take a near-white one.
 */
export function deriveAccentFg(accent9: string): string {
  const match = accent9.match(/oklch\(\s*([0-9.]+)/)
  if (!match) return 'oklch(0.99 0 0)'
  const l = Number.parseFloat(match[1])
  return l < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
}

export function rampToCss(ramp: Ramp): string {
  const lightVars = ramp.light.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const darkVars = ramp.dark.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const lightFg = deriveAccentFg(ramp.light[8].value)
  const darkFg = deriveAccentFg(ramp.dark[8].value)
  return `:root {
${lightVars}
  --color-accent-fg: ${lightFg};
}
.dark {
${darkVars}
  --color-accent-fg: ${darkFg};
}`
}
