#!/usr/bin/env node
/**
 * figma-drift-check.mjs
 *
 * Compares the live Figma state of a component set against the CVA source
 * of truth. Reports any property that was changed in Figma and no longer
 * matches what the code expresses.
 *
 * Inputs:
 *   1. figma-sync-components output (CVA spec):
 *        packages/core/scripts/.figma/components/<name>.json
 *   2. Figma live state JSON — produced by an MCP agent that walks the
 *      ComponentSet via use_figma and dumps:
 *        { component, variants: [{ name, props: { paddingLeft, padRight,
 *          cornerRadius, itemSpacing, height, fill, textFill, stroke,
 *          textStyle } }] }
 *      The agent should write this to .figma/live/<name>.json before
 *      running this script.
 *
 * Usage:
 *   node packages/core/scripts/figma-drift-check.mjs button
 *
 * Exit codes:
 *   0 — no drift
 *   1 — drift detected (details printed to stdout)
 *   2 — missing input file
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SPEC_DIR = join(HERE, '.figma', 'components')
const LIVE_DIR = join(HERE, '.figma', 'live')

const componentName = process.argv[2]
if (!componentName) {
  console.error('Usage: figma-drift-check.mjs <component-name>')
  process.exit(2)
}

const specPath = resolve(SPEC_DIR, `${componentName}.json`)
const livePath = resolve(LIVE_DIR, `${componentName}.json`)

for (const p of [specPath, livePath]) {
  if (!existsSync(p)) {
    console.error(`Missing input: ${p}`)
    if (p === specPath) console.error('  Run: node packages/core/scripts/figma-sync-components.mjs ' + componentName)
    if (p === livePath) console.error('  Produce via: MCP agent dumps Figma state to .figma/live/' + componentName + '.json')
    process.exit(2)
  }
}

const spec = JSON.parse(readFileSync(specPath, 'utf8'))
const live = JSON.parse(readFileSync(livePath, 'utf8'))

/**
 * Resolve the expected spec for a single variant (given its axis values).
 * For Button: { Variant, Color, Size, State } → merged tokens.
 */
function expectedFor(axisValues) {
  const tokens = {
    bg: null, text: null, border: null,
    padding: null, radius: null, gap: null, height: null, shadow: null,
  }
  // 1) Per-axis tokens (typically Size drives geometry)
  for (const [axis, val] of Object.entries(axisValues)) {
    const axisEntry = spec.axesResolved?.[axis.toLowerCase()]?.[val]
    if (!axisEntry) continue
    for (const key of Object.keys(tokens)) {
      const arr = axisEntry.tokens?.[key]
      if (arr?.length) tokens[key] = arr[arr.length - 1] // last-wins within class string
    }
  }
  // 2) Compound variants — narrow match wins
  for (const cv of spec.compoundVariants) {
    const matches = Object.entries(cv.match).every(([k, v]) => axisValues[k] === v || axisValues[k.toLowerCase()] === v)
    if (!matches) continue
    for (const key of Object.keys(tokens)) {
      const arr = cv.tokens?.[key]
      if (arr?.length) tokens[key] = arr[arr.length - 1]
    }
  }
  return tokens
}

function parseVariantName(name) {
  const out = {}
  for (const part of name.split(',').map(s => s.trim())) {
    const [k, v] = part.split('=')
    if (k && v) out[k] = v
  }
  return out
}

const drifts = []
for (const variant of live.variants || []) {
  const axes = parseVariantName(variant.name)
  const expected = expectedFor(axes)
  const actual = variant.props || {}
  const diff = {}
  const checks = [
    ['fill', expected.bg, actual.fill],
    ['textFill', expected.text, actual.textFill],
    ['stroke', expected.border, actual.stroke],
    ['padding', expected.padding, actual.paddingHint],
    ['radius', expected.radius, actual.radiusHint],
    ['gap', expected.gap, actual.gapHint],
    ['height', expected.height, actual.heightHint],
    ['shadow', expected.shadow, actual.shadow],
  ]
  for (const [key, exp, act] of checks) {
    if (exp == null && act == null) continue
    // Compare by token name; the MCP agent should have normalized both sides to DS token strings.
    if (exp !== act) diff[key] = { expected: exp ?? '(none)', actual: act ?? '(none)' }
  }
  if (Object.keys(diff).length) drifts.push({ variant: variant.name, diff })
}

if (drifts.length === 0) {
  console.log(`No drift on ${componentName} (${live.variants?.length ?? 0} variants checked against ${spec.compoundVariants.length} compound rules).`)
  process.exit(0)
}

console.log(`DRIFT on ${componentName}: ${drifts.length} variant(s) differ from CVA source.\n`)
for (const d of drifts) {
  console.log(`  ${d.variant}`)
  for (const [key, delta] of Object.entries(d.diff)) {
    console.log(`    ${key}: expected ${delta.expected}, got ${delta.actual}`)
  }
  console.log('')
}
console.log(`Source of truth: ${spec.source}`)
console.log(`Live snapshot:   ${livePath}`)
process.exit(1)
