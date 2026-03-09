/** Convert hex to HSL */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return [h * 360, s * 100, l * 100]
}

/** Convert HSL to hex */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Shade stops and their target lightness offsets from base */
const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
type Shade = (typeof SHADE_STOPS)[number]

/**
 * Lightness ratios derived from median of all 13 chromatic scales in primitives.css.
 * Each value = median(L[shade] / L[500]) across pink, purple, green, red, yellow,
 * blue, teal, amber, slate, indigo, cyan, orange, emerald.
 */
const L_RATIO: Record<Shade, number> = {
  50:  2.092,
  100: 1.895,
  200: 1.821,
  300: 1.569,
  400: 1.258,
  500: 1.000,
  600: 0.853,
  700: 0.688,
  800: 0.544,
  900: 0.380,
  950: 0.231,
}

/**
 * Saturation ratios — empirically nearly flat (0.94–1.08).
 * The hand-tuned scales barely change saturation across shades.
 */
const S_RATIO: Record<Shade, number> = {
  50:  1.053,
  100: 1.053,
  200: 1.028,
  300: 0.978,
  400: 0.944,
  500: 1.000,
  600: 1.043,
  700: 1.000,
  800: 1.041,
  900: 1.019,
  950: 1.075,
}

/**
 * Generate a full color scale from a single base color.
 * The base color is placed at the 500 stop. Lightness and saturation
 * ratios are derived from the median curves of shilp-sutra's 13
 * hand-tuned chromatic scales in primitives.css.
 */
export function generateColorScale(baseHex: string): Record<Shade, string> {
  const [h, s, l] = hexToHsl(baseHex)

  const scale = {} as Record<Shade, string>
  for (const shade of SHADE_STOPS) {
    const targetL = Math.min(100, Math.max(0, l * L_RATIO[shade]))
    const targetS = Math.min(100, Math.max(0, s * S_RATIO[shade]))
    scale[shade] = hslToHex(h, targetS, targetL)
  }
  return scale
}

export { SHADE_STOPS }
export type { Shade }
