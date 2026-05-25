#!/usr/bin/env node
/**
 * One-shot migration: bare radius classes → semantic role tokens.
 *
 * Maps:
 *   rounded-ds-md   → rounded-control
 *   rounded-ds-sm   → rounded-control-inner
 *   rounded-ds-lg   → rounded-surface         (panels/cards/listbox/popover content)
 *   rounded-ds-xl   → rounded-overlay-lg      (dialog/sheet/picker)
 *   rounded-ds-2xl  → rounded-bubble
 *   rounded-ds-full → rounded-pill
 *   rounded-ds-none → rounded-none            (bare TW — stays 0)
 *   rounded-full    → rounded-pill
 *
 * Corner-prefixed variants (rounded-l/r/t/b/tl/tr/bl/br-ds-X) map the same way
 * while preserving the corner prefix.
 *
 * Modifiers (focus-visible:, hover:, group-data-..., md:, etc.) preserved.
 *
 * Note on ds-lg → surface vs overlay: both resolve to 10px in the default
 * preset, so visual fidelity is preserved either way. We pick `surface` as
 * the bulk-mapping default; consumers who want overlay semantics can hand-tune.
 *
 * Usage:
 *   node scripts/migrate-radius-roles.mjs           # dry-run, prints diff summary
 *   node scripts/migrate-radius-roles.mjs --write   # actually writes
 */

import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'node:fs'
import { join, resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const WRITE = process.argv.includes('--write')

// Order matters: longer patterns first (rounded-ds-2xl before rounded-ds-sm),
// rounded-ds-full before rounded-ds- (otherwise it'd match -full as a token).
const REPLACEMENTS = [
  // Full-class (no corner prefix), longest first to avoid partial matches.
  // `\b` word boundaries scope the match.
  // ds-* tokens
  { re: /\brounded-ds-2xl\b/g, to: 'rounded-bubble' },
  { re: /\brounded-ds-xl\b/g, to: 'rounded-overlay-lg' },
  { re: /\brounded-ds-lg\b/g, to: 'rounded-surface' },
  { re: /\brounded-ds-md\b/g, to: 'rounded-control' },
  { re: /\brounded-ds-sm\b/g, to: 'rounded-control-inner' },
  { re: /\brounded-ds-full\b/g, to: 'rounded-pill' },
  { re: /\brounded-ds-none\b/g, to: 'rounded-none' },
  // Corner-prefixed (rounded-l-ds-X, rounded-r-ds-X, etc.)
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-2xl\b/g, to: 'rounded-$1-bubble' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-xl\b/g, to: 'rounded-$1-overlay-lg' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-lg\b/g, to: 'rounded-$1-surface' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-md\b/g, to: 'rounded-$1-control' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-sm\b/g, to: 'rounded-$1-control-inner' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-full\b/g, to: 'rounded-$1-pill' },
  { re: /\brounded-([lrtb]l?|[lrtb]r?)-ds-none\b/g, to: 'rounded-$1-none' },
  // Bare rounded-full (no -ds-) → rounded-pill. Keep word boundaries to avoid
  // touching rounded-full-something.
  { re: /\brounded-full\b/g, to: 'rounded-pill' },
]

const SCAN_GLOBS = [
  'packages/core/src/**/*.tsx',
  'packages/core/src/**/*.ts',
  'apps/site/app/**/*.tsx',
  'apps/site/app/**/*.ts',
  'apps/site/components/**/*.tsx',
  'apps/site/components/**/*.ts',
]

// Files that intentionally demonstrate raw radius tokens (Foundations docs,
// token visualizations). Leave them alone — they're showing the primitives.
const INTENTIONAL_RAW_TOKEN_FILES = [
  'packages/core/src/tokens/forced-colors.stories.tsx',
  'packages/core/src/tokens/FoundationsShowcase.tsx',
]

// Skip files that have radius classes inside markdown/text content rather than
// classNames. Currently none — but we exclude generated/built output.
const EXCLUDES = (file) => {
  const n = file.replace(/\\/g, '/')
  return (
    n.includes('/.next/') ||
    n.includes('/dist/') ||
    n.includes('/node_modules/') ||
    n.includes('/__tests__/') ||
    n.includes('.test.tsx') ||
    n.includes('.test.ts') ||
    INTENTIONAL_RAW_TOKEN_FILES.includes(n)
  )
}

const files = SCAN_GLOBS.flatMap((g) => globSync(g, { cwd: ROOT })).filter((f) => !EXCLUDES(f))

const unique = [...new Set(files)]
let touched = 0
let totalSubs = 0
const summary = []

for (const rel of unique) {
  const abs = join(ROOT, rel)
  const original = readFileSync(abs, 'utf-8')
  let next = original
  let subs = 0
  for (const { re, to } of REPLACEMENTS) {
    next = next.replace(re, (match, ...args) => {
      subs++
      totalSubs++
      // For corner-prefixed patterns, $1 is the corner indicator and we use replace's callback signature
      if (typeof args[0] === 'string' && /^[lrtb]l?$|^[lrtb]r?$/.test(args[0])) {
        return to.replace('$1', args[0])
      }
      return to
    })
  }
  if (next !== original) {
    touched++
    summary.push(`  ${rel}: ${subs} replacements`)
    if (WRITE) writeFileSync(abs, next, 'utf-8')
  }
}

console.log(`${WRITE ? 'WROTE' : 'DRY-RUN'} — ${touched} files touched, ${totalSubs} total replacements across ${unique.length} scanned.\n`)
if (summary.length) console.log(summary.join('\n'))
if (!WRITE) console.log('\n(Re-run with --write to apply.)')
