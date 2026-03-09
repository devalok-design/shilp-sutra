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
 * Generate a full color scale from a single base color.
 * The base color is placed at the 500 stop.
 * Lighter shades increase lightness + slightly decrease saturation.
 * Darker shades decrease lightness + slightly increase saturation.
 */
export function generateColorScale(baseHex: string): Record<Shade, string> {
  const [h, s, l] = hexToHsl(baseHex)

  // Target lightness for each stop — calibrated to match shilp-sutra's hand-tuned scales
  const lightnessMap: Record<Shade, number> = {
    50: Math.min(97, l + (97 - l) * 0.95),
    100: Math.min(93, l + (93 - l) * 0.85),
    200: Math.min(87, l + (87 - l) * 0.75),
    300: Math.min(78, l + (78 - l) * 0.60),
    400: l + (78 - l) * 0.30,
    500: l,
    600: l * 0.78,
    700: l * 0.60,
    800: l * 0.42,
    900: l * 0.28,
    950: l * 0.17,
  }

  // Saturation adjustments — keep saturation high to preserve color identity.
  // Warm hues (yellow, orange, amber) lose their color at low saturation,
  // so the lighter shades must stay vibrant rather than fading to gray.
  const saturationMap: Record<Shade, number> = {
    50: Math.min(100, s * 0.85),
    100: Math.min(100, s * 0.88),
    200: Math.min(100, s * 0.90),
    300: Math.min(100, s * 0.92),
    400: Math.min(100, s * 0.96),
    500: s,
    600: Math.min(100, s * 1.02),
    700: Math.min(100, s * 1.05),
    800: Math.min(100, s * 1.0),
    900: Math.min(100, s * 0.95),
    950: Math.min(100, s * 0.90),
  }

  const scale = {} as Record<Shade, string>
  for (const shade of SHADE_STOPS) {
    scale[shade] = hslToHex(h, saturationMap[shade], lightnessMap[shade])
  }
  return scale
}

export { SHADE_STOPS }
export type { Shade }
