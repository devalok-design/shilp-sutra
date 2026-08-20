#!/usr/bin/env node
/**
 * figma-pull-tokens.mjs
 *
 * Brings token decisions made in Figma back into the codebase.
 *
 * WHY IT TAKES A FILE RATHER THAN CALLING FIGMA
 * The Variables REST API is available only to "full members of Enterprise orgs"
 * (verified 2026-08-18). Devalok is on Pro, so no script can read the file
 * directly. The OKLCH Ramp Generator plugin exports the same data as JSON, and
 * this consumes that.
 *
 *   Figma → plugin "Export tokens as JSON" → save → this script → PR
 *
 * WHAT IT UNDERSTANDS
 *   1. SEEDS      a ramp's hue, chroma and the contrast corrections on steps 9/10
 *   2. RE-POINTS  which step a semantic token aliases to
 *
 * Both are lossless. Neither converts a colour, so gamut clipping never enters
 * the picture. Hand-edited ramp steps are deliberately NOT supported: they break
 * the even lightness spacing and cannot be represented as a seed.
 *
 * Usage:
 *   node packages/core/scripts/figma-pull-tokens.mjs export.json            # report only
 *   node packages/core/scripts/figma-pull-tokens.mjs export.json --apply    # write the CSS/TS
 *
 * Exit 0 = no changes · 1 = changes found (or applied) · 2 = bad input
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE = join(HERE, '..')
const SCALE = join(CORE, 'src', 'tokens', 'generate-scale.ts')
const SEMANTIC = join(CORE, 'src', 'tokens', 'semantic.css')

const [, , inputPath, ...flags] = process.argv
const APPLY = flags.includes('--apply')

if (!inputPath) {
  console.error('Usage: figma-pull-tokens.mjs <export.json> [--apply]')
  console.error('Get the export from the OKLCH Ramp Generator plugin: "Export tokens as JSON".')
  process.exit(2)
}
if (!existsSync(inputPath)) {
  console.error(`No such file: ${inputPath}`)
  process.exit(2)
}

const data = JSON.parse(readFileSync(inputPath, 'utf8'))
if (!data.seeds || !data.semantic) {
  console.error('That file does not look like a plugin export (expected "seeds" and "semantic" keys).')
  process.exit(2)
}

/**
 * Which primitive ramp backs each intent in the Devalok brand. Figma routes
 * intent steps through the Brand collection; the CSS points straight at the
 * ramp, so a Figma target of `brand/accent/9` means `var(--pink-9)` in CSS.
 */
const BRAND_MAP = {
  accent: 'pink', error: 'red', success: 'green',
  warning: 'amber-bright', info: 'blue', neutral: 'neutral',
}

// ── Seeds ───────────────────────────────────────────────────────────────────

function currentSeeds() {
  const src = readFileSync(SCALE, 'utf8')
  const start = src.indexOf('BRAND_PALETTES')
  const open = src.indexOf('{', start)
  let depth = 0, close = open
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') { depth--; if (depth === 0) { close = i; break } }
  }
  const body = src.slice(open + 1, close)
  const out = {}
  for (const m of body.matchAll(/([\w-]+)\s*:\s*\{/g)) {
    const s = m.index + m[0].length - 1
    let d = 0, e = s
    for (let i = s; i < body.length; i++) {
      if (body[i] === '{') d++
      else if (body[i] === '}') { d--; if (d === 0) { e = i; break } }
    }
    const entry = body.slice(s, e + 1)
    if (m[1] === 'correction') continue
    const num = (k) => {
      const hit = entry.match(new RegExp(`${k}\\s*:\\s*(-?[\\d.]+)`))
      return hit ? Number(hit[1]) : 0
    }
    if (/hue\s*:/.test(entry)) {
      out[m[1]] = { hue: num('hue'), chroma: num('peakChroma'), light9: num('light9'), dark9: num('dark9'), dark10: num('dark10') }
    }
  }
  return out
}

const before = currentSeeds()
const seedChanges = []
for (const [ramp, s] of Object.entries(data.seeds)) {
  const cur = before[ramp]
  if (!cur) {
    // A ramp that exists in Figma but not in the generator, e.g. the derived
    // Waybill ramps. Not an error; just not ours to write.
    seedChanges.push({ ramp, kind: 'new', figma: s })
    continue
  }
  // Figma stores FLOAT variables as f32, so 0.19 reads back as 0.1899999976158142.
  // Compare at the precision the source file actually writes, or every untouched
  // ramp reports as changed.
  const round = (n, dp) => Math.round(n * 10 ** dp) / 10 ** dp
  const fields = [
    ['hue', s.hue, cur.hue, 1],
    ['chroma', s.chroma, cur.chroma, 4],
    ['light9', s.light9 || 0, cur.light9, 3],
    ['dark9', s.dark9 || 0, cur.dark9, 3],
    ['dark10', s.dark10 || 0, cur.dark10, 3],
  ]
  for (const [field, fig, code, dp] of fields) {
    if (typeof fig !== 'number') continue
    const a = round(fig, dp)
    const b = round(code, dp)
    if (a !== b) seedChanges.push({ ramp, kind: 'changed', field, from: b, to: a })
  }
}

// ── Re-points ───────────────────────────────────────────────────────────────

/**
 * Read the semantic alias map out of the CSS.
 *
 * Two traps here, both hit while writing this:
 *  1. The colour tokens are NOT in `:root`. This is Tailwind 4, so they live in
 *     `@theme { }`. Reading `:root` returns zero colour tokens and the script
 *     silently reports no re-points.
 *  2. A selector can appear more than once. semantic.css has four `:root`
 *     blocks. Matching only the first one misses whatever is in the rest, so
 *     every block is collected and merged.
 */
function grabAll(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const out = {}
  for (const m of css.matchAll(new RegExp(`^[ \\t]*${escaped}[ \\t]*\\{`, 'gm'))) {
    const open = css.indexOf('{', m.index)
    let d = 1, i = open + 1
    while (i < css.length && d > 0) { if (css[i] === '{') d++; else if (css[i] === '}') d--; if (d === 0) break; i++ }
    for (const line of css.slice(open + 1, i).split('\n')) {
      const v = line.match(/^\s*(--color-[a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)\s*;/)
      if (v) out[v[1]] = v[2]
    }
  }
  return out
}

function currentAliases() {
  const css = readFileSync(SEMANTIC, 'utf8')
  // @theme carries the light values; .dark re-points a subset of them.
  const light = Object.assign({}, grabAll(css, ':root'), grabAll(css, '@theme'))
  const dark = grabAll(css, '.dark')
  if (Object.keys(light).length === 0) {
    console.error('Read zero light-mode colour tokens from semantic.css. The file structure changed; fix this parser before trusting the result.')
    process.exit(2)
  }
  return { Light: light, Dark: dark }
}

const cssAliases = currentAliases()
const repoints = []
for (const [figName, perMode] of Object.entries(data.semantic)) {
  const cssName = '--color-' + figName.replace(/\/(\d+)$/, '-$1')
  for (const [mode, entry] of Object.entries(perMode)) {
    if (!entry || !entry.alias) continue
    let resolved = entry.alias
    const bm = resolved.match(/^brand\/(\w+)\/(\d+)$/)
    if (bm) {
      const ramp = BRAND_MAP[bm[1]]
      if (!ramp) continue
      resolved = `${ramp}-${bm[2]}`
    } else {
      resolved = resolved.replace('/', '-')
    }
    const current = (cssAliases[mode] || {})[cssName]
    // Absent in the CSS for that mode means it inherits :root; only flag a real change
    const compare = current !== undefined ? current : (mode === 'Dark' ? cssAliases.Light[cssName] : undefined)
    if (compare !== undefined && compare !== resolved) {
      repoints.push({ token: cssName, mode, from: compare, to: resolved })
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

console.log(`Export from: ${data.exportedFrom || '(unknown file)'}`)
console.log(`Ramps: ${Object.keys(data.seeds).length} · Semantic tokens: ${Object.keys(data.semantic).length}`)
console.log('')

const changed = seedChanges.filter((c) => c.kind === 'changed')
const newRamps = seedChanges.filter((c) => c.kind === 'new')

if (!changed.length && !repoints.length) {
  console.log('No changes. Figma and the codebase agree.')
  if (newRamps.length) {
    console.log(`\n${newRamps.length} ramp(s) exist in Figma but not in generate-scale.ts:`)
    for (const r of newRamps) console.log(`  ${r.ramp} (hue ${r.figma.hue}, chroma ${r.figma.chroma})`)
    console.log('  These are not written back. Add them to BRAND_PALETTES by hand if they should ship.')
  }
  process.exit(0)
}

if (changed.length) {
  console.log(`SEED CHANGES (${changed.length}) — recolours, safe to ship as a minor`)
  for (const c of changed) console.log(`  ${c.ramp}.${c.field}: ${c.from} → ${c.to}`)
  console.log('')
}
if (repoints.length) {
  console.log(`RE-POINTS (${repoints.length}) — a role now uses a different step`)
  for (const r of repoints) console.log(`  ${r.token} [${r.mode}]: var(--${r.from}) → var(--${r.to})`)
  console.log('')
}

// Spacing, radius and type are not in the export yet. When they are, they must
// be reported separately: they move every layout in every consuming app, which
// is a breaking visual change rather than a recolour.
console.log('Note: spacing, radius and typography are not covered by this export.')
console.log('When they are, they must be flagged as visually breaking, not batched with colour.')

if (!APPLY) {
  console.log('\nReport only. Re-run with --apply to write these into the source files.')
  process.exit(1)
}

// ── Apply ───────────────────────────────────────────────────────────────────

let scaleSrc = readFileSync(SCALE, 'utf8')
let applied = 0
for (const c of changed) {
  const rampRe = new RegExp(`(${c.ramp}\\s*:\\s*\\{[^}]*?)${c.field === 'chroma' ? 'peakChroma' : c.field}\\s*:\\s*-?[\\d.]+`)
  const key = c.field === 'chroma' ? 'peakChroma' : c.field
  if (rampRe.test(scaleSrc)) {
    scaleSrc = scaleSrc.replace(rampRe, `$1${key}: ${c.to}`)
    applied++
  } else {
    console.error(`  could not locate ${c.ramp}.${key} in generate-scale.ts — apply by hand`)
  }
}
if (applied) writeFileSync(SCALE, scaleSrc)

let cssSrc = readFileSync(SEMANTIC, 'utf8')
let cssApplied = 0
for (const r of repoints) {
  const re = new RegExp(`(${r.token}\\s*:\\s*)var\\(--${r.from}\\)`)
  if (re.test(cssSrc)) { cssSrc = cssSrc.replace(re, `$1var(--${r.to})`); cssApplied++ }
  else console.error(`  could not locate ${r.token} → var(--${r.from}) in semantic.css — apply by hand`)
}
if (cssApplied) writeFileSync(SEMANTIC, cssSrc)

console.log(`\nApplied ${applied} seed change(s) and ${cssApplied} re-point(s).`)
console.log('Next:')
console.log('  1. node packages/core/scripts/figma-sync-tokens.mjs')
console.log('  2. node packages/core/figma-plugin/verify-parity.mjs')
console.log('  3. review the diff, then open a PR')
process.exit(1)
