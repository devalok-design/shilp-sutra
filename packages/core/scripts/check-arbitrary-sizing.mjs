#!/usr/bin/env node
/**
 * check-arbitrary-sizing.mjs
 *
 * Guards against hand-typed pixel sizing in component source. Flags any
 * `(min-|max-)?[hw]-[Npx]` arbitrary value whose pixel amount HAS an equivalent
 * `--spacing-ds-*` token — those should use the token (h-ds-05, min-w-ds-11, …).
 *
 * Pixel amounts with no matching token ("gaps") are allowed: they're either
 * component-specific dimensions or layout values off the spacing scale. This
 * keeps the gate self-maintaining — add a token to the scale and it starts
 * being enforced automatically; no hand-kept allowlist.
 *
 * Usage (from packages/core/):
 *   node scripts/check-arbitrary-sizing.mjs          # report
 *   node scripts/check-arbitrary-sizing.mjs --check  # CI gate: exit 1 on any violation
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const SCAN_DIRS = ['ui', 'composed']

// px → the `ds` spacing token it should use (mirrors --spacing-ds-* in
// tokens/semantic.css). 1px → Tailwind's built-in `px`. Keep in sync with the scale.
const PX_TO_TOKEN = {
  1: 'px', 2: 'ds-01', 4: 'ds-02', 6: 'ds-02b', 8: 'ds-03', 12: 'ds-04',
  16: 'ds-05', 20: 'ds-05b', 24: 'ds-06', 28: 'ds-06b', 32: 'ds-07',
  40: 'ds-08', 48: 'ds-09', 64: 'ds-10', 80: 'ds-11', 96: 'ds-12', 160: 'ds-13',
}

const ARBITRARY_SIZE = /\b((?:min-|max-)?)([hw])-\[(\d+)px\]/g

function scan(dir, out) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const p = join(dir, e)
    const s = statSync(p)
    if (s.isDirectory()) { scan(p, out); continue }
    if (!p.endsWith('.tsx')) continue
    if (/\.(test|stories)\.tsx$/.test(p)) continue
    const src = readFileSync(p, 'utf8')
    const lines = src.split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(ARBITRARY_SIZE)) {
        const px = Number(m[3])
        const token = PX_TO_TOKEN[px]
        if (!token) continue // gap — off the scale, allowed
        const suggestion = token === 'px' ? `${m[1]}${m[2]}-px` : `${m[1]}${m[2]}-${token}`
        out.push({ file: relative(ROOT, p), line: i + 1, found: m[0], suggestion })
      }
    })
  }
}

const violations = []
for (const d of SCAN_DIRS) scan(join(SRC, d), violations)

const checkMode = process.argv.includes('--check')

if (violations.length === 0) {
  console.log('No token-backed arbitrary sizing found in src/ui + src/composed.')
  process.exit(0)
}

console.error(`\nArbitrary pixel sizing that has a spacing token (${violations.length}):\n`)
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.found} → ${v.suggestion}`)
}
console.error('\nUse the `ds` spacing token instead of a hand-typed pixel value.')
console.error('(Pixel values with no token on the scale are allowed and not listed.)\n')
process.exit(checkMode ? 1 : 0)
