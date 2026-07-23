#!/usr/bin/env node
/**
 * sweep-card-border.mjs
 *
 * Softens harsh CARD/PANEL edges to the faint `border-card` hairline (the locked
 * anti-slop card-edge rule), WITHOUT touching interactive-control edges — those
 * keep `border-surface-border`/`-strong` for WCAG 1.4.11 non-text contrast.
 *
 * A site is a high-confidence CARD edge when its line has:
 *   - a candidate color token: `border-surface-border` or `border-surface-border-subtle`
 *   - a bare all-side `border` width (not a directional `border-t/b/l/r` divider)
 *   - a card surface/rounded signal (bg-surface-2/raised/3, rounded-ds-lg/xl, rounded-surface)
 *   - and NO interactive signal (focus:/hover:border/<input|textarea|button|select)
 * Everything else is reported LOW (review) and left untouched.
 *
 * DEFAULT = dry-run. Pass --write to apply high-confidence swaps.
 *   node scripts/sweep-card-border.mjs           # dry-run
 *   node scripts/sweep-card-border.mjs --write
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const SCAN_DIRS = ['ui', 'composed', 'shell', 'ai']
const WRITE = process.argv.includes('--write')

// Control-component files: their borders are interactive edges (WCAG 1.4.11) — never auto-soften.
const CONTROL_FILE = /(radio|checkbox|switch|segmented|stepper|autocomplete|combobox|select|input|textarea|oauth|slider|toggle|picker|number|chat-input|text-editor|\bform)/i
const CARD_BG = /\bbg-surface-(2|3|raised)\b/
const CARD_ROUND = /\brounded-(ds-lg|ds-xl|surface|card)\b/
const ALL_SIDE_BORDER = /(?:^|[\s"'`(])border(?=[\s"'`)])/ // bare `border`, not border-x/color
const INTERACTIVE = /focus:|focus-visible:|hover:border|<input|<textarea|<select|<button|aria-invalid/
const CANDIDATE = /\bborder-surface-border(?:-subtle)?\b(?!\/)/ // not -strong, not -card, not already /NN

function classify(line) {
  if (!CANDIDATE.test(line)) return null
  const card = CARD_BG.test(line) || CARD_ROUND.test(line)
  const allSide = ALL_SIDE_BORDER.test(line)
  const interactive = INTERACTIVE.test(line)
  if (card && allSide && !interactive) return 'high'
  return 'low'
}

function scan(dir, files) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const p = join(dir, e)
    const s = statSync(p)
    if (s.isDirectory()) { scan(p, files); continue }
    if (!p.endsWith('.tsx')) continue
    if (/\.(test|stories)\.tsx$/.test(p)) continue
    files.push(p)
  }
}

const files = []
for (const d of SCAN_DIRS) scan(join(SRC, d), files)

let swaps = 0
const high = []
const low = []
for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const isControl = CONTROL_FILE.test(rel)
  const orig = readFileSync(file, 'utf8')
  let changed = false
  const out = orig.split('\n').map((line, i) => {
    const verdict = classify(line)
    if (!verdict) return line
    // Control-component files: downgrade every candidate to review — never auto-soften a control edge.
    if (verdict === 'low' || isControl) { low.push({ rel, line: i + 1 }); return line }
    high.push({ rel, line: i + 1 })
    changed = true
    swaps++
    return line.replace(/\bborder-surface-border(-subtle)?\b(?!\/)/g, 'border-card')
  }).join('\n')
  if (changed && WRITE) writeFileSync(file, out)
}

console.log(`\n  card-border sweep ${WRITE ? 'APPLIED' : '(dry-run)'}`)
console.log(`  high-confidence card edges: ${high.length} (across ${new Set(high.map((h) => h.rel)).size} files)`)
console.log(`  low/left-for-review: ${low.length}\n`)
console.log('  high-confidence files:')
const byFile = high.reduce((m, h) => ((m[h.rel] = (m[h.rel] || 0) + 1), m), {})
for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(n).padStart(3)}  ${f}`)
if (!WRITE) console.log(`\n  Dry-run. Re-run with --write, then typecheck + visual diff.\n`)
else console.log(`\n  Applied ${swaps} swaps → border-card. Next: pnpm typecheck, then visual diff.\n`)
