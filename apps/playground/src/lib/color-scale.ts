// ── sRGB ↔ Linear RGB ────────────────────────────────────────────────
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

// ── Linear RGB ↔ Oklab ──────────────────────────────────────────────
function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ]
}

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]
}

// ── Oklab ↔ OKLCH ───────────────────────────────────────────────────
function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
  const C = Math.sqrt(a * a + b * b)
  const h = (Math.atan2(b, a) * 180) / Math.PI
  return [L, C, h < 0 ? h + 360 : h]
}

function oklchToOklab(L: number, C: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180
  return [L, C * Math.cos(rad), C * Math.sin(rad)]
}

// ── Hex conversion ──────────────────────────────────────────────────
function hexToOklch(hex: string): [number, number, number] {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255)
  const [L, a, bb] = linearRgbToOklab(r, g, b)
  return oklabToOklch(L, a, bb)
}

function oklchToHex(L: number, C: number, h: number): string {
  const [labL, a, b] = oklchToOklab(L, C, h)
  const [lr, lg, lb] = oklabToLinearRgb(labL, a, b)
  const toHex = (v: number) =>
    Math.round(255 * Math.max(0, Math.min(1, linearToSrgb(v))))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`
}

// ── Gamut clipping via binary search on chroma ──────────────────────
function inGamut(r: number, g: number, b: number): boolean {
  return r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && b >= -0.001 && b <= 1.001
}

function gamutClipOklch(L: number, C: number, h: number): [number, number, number] {
  const [labL, a, b] = oklchToOklab(L, C, h)
  const [lr, lg, lb] = oklabToLinearRgb(labL, a, b)
  if (inGamut(lr, lg, lb)) return [L, C, h]

  let lo = 0
  let hi = C
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    const [mL, ma, mb] = oklchToOklab(L, mid, h)
    const [mr, mg, mbb] = oklabToLinearRgb(mL, ma, mb)
    if (inGamut(mr, mg, mbb)) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return [L, lo, h]
}

// ── Scale generation ────────────────────────────────────────────────
const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
type Shade = (typeof SHADE_STOPS)[number]

/**
 * Target lightness values for each shade stop in OKLCH (0–1 scale).
 * Derived from Evil Martians' Harmony approach — these map to
 * perceptually uniform lightness steps.
 */
const TARGET_L: Record<Shade, number> = {
  50:  0.9778,
  100: 0.9356,
  200: 0.8811,
  300: 0.8267,
  400: 0.7422,
  500: 0.6478,
  600: 0.5733,
  700: 0.4689,
  800: 0.3944,
  900: 0.3200,
  950: 0.2378,
}

/**
 * Chroma scale factors relative to the base color's chroma.
 * Lighter and darker shades have less chroma; mid-tones peak.
 */
const CHROMA_FACTOR: Record<Shade, number> = {
  50:  0.07,
  100: 0.22,
  200: 0.41,
  300: 0.62,
  400: 0.95,
  500: 1.00,
  600: 0.88,
  700: 0.73,
  800: 0.61,
  900: 0.49,
  950: 0.37,
}

/**
 * Generate a full color scale from a single base hex color using OKLCH.
 * The base color anchors the hue and max chroma. Lightness uses fixed
 * perceptually-uniform targets; chroma scales proportionally.
 * Out-of-gamut colors are clipped via binary search on chroma.
 */
export function generateColorScale(baseHex: string): Record<Shade, string> {
  const [, baseC, baseH] = hexToOklch(baseHex)

  const scale = {} as Record<Shade, string>
  for (const shade of SHADE_STOPS) {
    const L = TARGET_L[shade]
    const C = baseC * CHROMA_FACTOR[shade]
    const [clL, clC, clH] = gamutClipOklch(L, C, baseH)
    scale[shade] = oklchToHex(clL, clC, clH)
  }
  return scale
}

export { SHADE_STOPS }
export type { Shade }
