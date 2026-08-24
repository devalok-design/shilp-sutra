#!/usr/bin/env node
/**
 * verify-parity.mjs
 *
 * Asserts the Figma plugin generates exactly the same ramps as the codebase.
 *
 * The plugin duplicates the lightness curve, chroma weights, dark-mode boost and
 * per-ramp corrections from `src/tokens/generate-scale.ts`. Duplicated constants
 * drift. When they do, a designer regenerating a ramp in Figma silently gets
 * different colours from the ones the code ships, with nothing to warn them.
 *
 *   node packages/core/figma-plugin/verify-parity.mjs
 *
 * Exit 0 = in parity · 1 = drift · 2 = inputs missing or nothing compared
 *
 * Two things this caught while being written, both silent:
 *   1. The plugin returned the OKLab b-component as the sRGB blue channel, so
 *      every ramp was wrong in blue while looking entirely plausible.
 *   2. Steps 9/10 of pink, red, green, blue and neutral carry hand-applied
 *      contrast corrections that `generateScale` did not model — meaning it
 *      could not reproduce the palette it supposedly generates.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE = join(HERE, '..')
const PLUGIN = join(HERE, 'code.js')
const SCALE = join(CORE, 'src', 'tokens', 'generate-scale.ts')
const TOKENS = join(CORE, 'scripts', '.figma', 'tokens.json')

for (const [label, path] of [['plugin', PLUGIN], ['scale generator', SCALE], ['tokens.json', TOKENS]]) {
  if (!existsSync(path)) {
    console.error(`Missing ${label}: ${path}`)
    if (label === 'tokens.json') console.error('Run: node packages/core/scripts/figma-sync-tokens.mjs')
    process.exit(2)
  }
}

// The plugin guards its Figma calls on `typeof figma` and exports its pure
// functions when `module` exists, so requiring it here runs no Figma code.
const require = createRequire(import.meta.url)
const { generateRamp } = require(PLUGIN)

/** Index of the `}` closing the `{` at `open`. */
function matchBrace(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Parse BRAND_PALETTES out of the TypeScript source — the canonical seeds.
 * Brace-counted, because each entry contains a nested `correction: { … }` that
 * a lazy `(.+?)\}` would truncate.
 */
function loadSeeds() {
  const src = readFileSync(SCALE, 'utf8')
  const start = src.indexOf('BRAND_PALETTES')
  if (start === -1) throw new Error('BRAND_PALETTES not found in generate-scale.ts')
  const open = src.indexOf('{', start)
  const close = matchBrace(src, open)
  if (close === -1) throw new Error('Unbalanced braces in BRAND_PALETTES')
  const body = src.slice(open + 1, close)

  const seeds = {}
  for (const m of body.matchAll(/([\w-]+)\s*:\s*\{/g)) {
    const entryOpen = m.index + m[0].length - 1
    const entryClose = matchBrace(body, entryOpen)
    if (entryClose === -1) continue
    const entry = body.slice(entryOpen, entryClose + 1)

    // Skip the nested `correction` object — it is read as part of its parent.
    if (m[1] === 'correction') continue

    const num = (k) => {
      const hit = entry.match(new RegExp(`${k}\\s*:\\s*(-?[\\d.]+)`))
      return hit ? Number(hit[1]) : undefined
    }
    const hue = num('hue')
    const peakChroma = num('peakChroma')
    if (hue === undefined || peakChroma === undefined) continue

    seeds[m[1]] = {
      hue,
      peakChroma,
      isNeutral: /isNeutral\s*:\s*true/.test(entry),
      correction: {
        light9: num('light9') || 0,
        dark9: num('dark9') || 0,
        dark10: num('dark10') || 0,
      },
    }
  }
  return seeds
}

/** Reference OKLCH → sRGB hex, written independently of the plugin. */
function refHex({ L, C, H }) {
  const hr = (H * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const lc = l_ ** 3, mc = m_ ** 3, sc = s_ ** 3
  const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc
  const e = (c) => {
    c = c <= 0 ? 0 : c >= 1 ? 1 : c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${e(r)}${e(g)}${e(bl)}`
}

const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')

const seeds = loadSeeds()
const tokens = JSON.parse(readFileSync(TOKENS, 'utf8'))
const SRC = { light: tokens.primitives.colorLight, dark: tokens.primitives.colorDark }

let compared = 0
const drift = []
const absent = []

for (const [ramp, seed] of Object.entries(seeds)) {
  for (const mode of ['light', 'dark']) {
    const got = generateRamp(seed.hue, seed.peakChroma, mode === 'dark', seed.isNeutral, seed.correction).map(toHex)
    for (let i = 0; i < 12; i++) {
      const authored = SRC[mode][`--${ramp}-${i + 1}`]
      if (!authored) { absent.push(`${ramp}-${i + 1} ${mode}`); continue }
      compared++
      const want = refHex(authored)
      if (got[i] !== want) drift.push(`${ramp}-${i + 1} ${mode}: plugin ${got[i]} · tokens ${want}`)
    }
  }
}

console.log(`Ramps checked:   ${Object.keys(seeds).length}`)
console.log(`Values compared: ${compared}`)
if (absent.length) console.log(`Not in tokens:   ${absent.length} (seeded in code, absent from the CSS)`)

// A check that compares nothing is not a passing check. Guards against a parser
// change silently reducing this to a no-op.
const MIN_EXPECTED = 300
if (compared < MIN_EXPECTED) {
  console.error(`\nOnly ${compared} values compared (expected at least ${MIN_EXPECTED}).`)
  console.error('The seed parser or the token file is not returning what it should — a failure, not a pass.')
  process.exit(2)
}

if (drift.length) {
  console.error(`\nDRIFT — ${drift.length} value(s) differ between the plugin and the codebase:\n`)
  for (const d of drift.slice(0, 20)) console.error('  ' + d)
  if (drift.length > 20) console.error(`  … and ${drift.length - 20} more`)
  console.error('\nThe constants in figma-plugin/code.js no longer match generate-scale.ts.')
  console.error('Fix them in the same commit, or Figma and code produce different ramps.')
  process.exit(1)
}

console.log('\nIn parity — the plugin reproduces the codebase ramps exactly.')
