#!/usr/bin/env node
/**
 * audit-contrast.mjs
 *
 * Computes the WCAG contrast ratio of foreground/background token pairings
 * straight from `primitives.css`, and fails if any pairing used for body text
 * drops under AA's 4.5:1.
 *
 * WHY THIS EXISTS
 * ---------------
 * `--color-surface-fg-subtle` shipped at 4.472:1 on the light `surface-base` —
 * a miss of 0.028. It carried the comment `/* darkened for WCAG AA 4.5:1 *␘/`,
 * so a previous adjustment had been made with exactly this intent and landed
 * short. The value looked right, the comment claimed it was right, and nothing
 * checked. It reached npm and was found by an external audit of the rendered
 * app, not by us.
 *
 * A comment cannot verify a ratio. This can. Anything asserting WCAG
 * compliance in this repo should be computed, not stated.
 *
 * SCOPE — deliberately narrow. Only pairings listed in PAIRINGS below are
 * checked, because only a human knows which token lands on which surface as
 * body-sized text. This is not a substitute for axe over rendered output; it
 * is a guard on the specific pairings we have already reasoned about, so they
 * cannot silently regress.
 *
 * Usage:
 *   node scripts/audit-contrast.mjs
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PRIMITIVES = join(ROOT, 'packages', 'core', 'src', 'tokens', 'primitives.css')

/**
 * Each entry: a foreground scale step rendered on a background scale step, per
 * theme, at normal text size. `min` is the WCAG level that pairing must clear.
 */
// Step indices track the semantic mapping in semantic.css. The 2026-08 surface
// rebuild moved light `surface-base` from neutral-2 to neutral-0, which left
// this table asserting a pairing the system no longer has — it passed while
// checking the wrong thing. Keep these in step with semantic.css.
const PAIRINGS = [
  // page
  { theme: 'light', fg: 9, bg: 0, min: 4.5, as: '--color-surface-fg-subtle on --color-surface-base' },
  { theme: 'dark', fg: 9, bg: 1, min: 4.5, as: '--color-surface-fg-subtle on --color-surface-base' },
  { theme: 'light', fg: 11, bg: 0, min: 4.5, as: '--color-surface-fg-muted on --color-surface-base' },
  { theme: 'dark', fg: 11, bg: 1, min: 4.5, as: '--color-surface-fg-muted on --color-surface-base' },
  // panel — the same white as the page in light, a genuine lift in dark
  { theme: 'dark', fg: 9, bg: 2, min: 4.5, as: '--color-surface-fg-subtle on --color-surface-panel' },
  { theme: 'dark', fg: 11, bg: 2, min: 4.5, as: '--color-surface-fg-muted on --color-surface-panel' },
  // hover — text sits on it whenever a row is hovered
  { theme: 'light', fg: 9, bg: 2, min: 4.5, as: '--color-surface-fg-subtle on --color-surface-panel-hover' },
  { theme: 'dark', fg: 9, bg: 3, min: 4.5, as: '--color-surface-fg-subtle on --color-surface-panel-hover' },
  // Sunken wells take fg-muted, NOT fg-subtle — that pairing measures 4.38:1
  // (audit finding A3) and is enforced by shilp-sutra/no-subtle-text-on-sunken.
  { theme: 'light', fg: 11, bg: 'sunken', min: 4.5, as: '--color-surface-fg-muted on --color-surface-sunken' },
  { theme: 'dark', fg: 11, bg: 'sunken', min: 4.5, as: '--color-surface-fg-muted on --color-surface-sunken' },
]

// ── OKLCH → sRGB → WCAG relative luminance ─────────────────────────────────
function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b2 = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b2
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b2
  const s_ = L - 0.0894841775 * a - 1.291485548 * b2
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const enc = (v) => {
    v = Math.max(0, Math.min(1, v))
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  }
  return [enc(r), enc(g), enc(b)]
}

const luminance = (c) => {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
}

const contrast = (a, b) => {
  const A = luminance(a)
  const B = luminance(b)
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05)
}

const toHex = (c) =>
  '#' + c.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()

// ── Parse the light and dark blocks ────────────────────────────────────────
const src = readFileSync(PRIMITIVES, 'utf8')
const darkIdx = src.indexOf('.dark')
if (darkIdx === -1) {
  console.error('audit-contrast: no `.dark` block found in primitives.css — parser needs updating.')
  process.exit(1)
}
const blocks = { light: src.slice(0, darkIdx), dark: src.slice(darkIdx) }

/** `n` is a scale index, or a named step such as `sunken`. */
function step(theme, n) {
  // neutral-0 is a plain hex, not an oklch triple.
  const hex = blocks[theme].match(new RegExp(`--neutral-${n}:\\s*#([0-9a-fA-F]{6})`))
  if (hex) {
    const h = hex[1]
    return { srgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) }
  }
  const m = blocks[theme].match(
    new RegExp(`--neutral-${n}:\\s*oklch\\(\\s*([0-9.]+)\\s+([0-9.]+)\\s+([0-9.]+)\\s*\\)`)
  )
  if (!m) {
    console.error(`audit-contrast: --neutral-${n} not found in the ${theme} block.`)
    process.exit(1)
  }
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]
}

/** A step is either an oklch triple to convert, or an already-resolved sRGB. */
function toSrgb(v) {
  return Array.isArray(v) ? oklchToSrgb(...v) : v.srgb
}

console.log('# audit-contrast\n')
let failures = 0

for (const p of PAIRINGS) {
  const fg = toSrgb(step(p.theme, p.fg))
  const bg = toSrgb(step(p.theme, p.bg))
  const r = contrast(fg, bg)
  const ok = r >= p.min
  if (!ok) failures++
  const delta = (r - p.min).toFixed(3)
  console.log(
    `  ${ok ? '✓' : '✗'} ${p.theme.padEnd(5)} ${toHex(fg)} on ${toHex(bg)}  ` +
      `${r.toFixed(3)}:1  (AA ${p.min}, ${ok ? '+' : ''}${delta})  ${p.as}`
  )
}

if (failures) {
  console.log(
    `\naudit-contrast: FAILED — ${failures} pairing(s) under WCAG AA.\n` +
      `Adjust the lightness of the offending --neutral-* step in primitives.css.\n` +
      `Leave real headroom: a pairing that clears by <0.1 will regress the next\n` +
      `time a surface token moves, which is how the 4.472 miss happened.`
  )
  process.exit(1)
}
console.log('\naudit-contrast: PASSED.')
