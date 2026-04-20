#!/usr/bin/env node

/**
 * Phase 1 of the 0.37 TW4 migration: rename CSS custom-property references
 * across source to match TW4-native theme namespaces.
 *
 *   --font-size-*     → --text-ds-*
 *   --line-height-*   → --leading-ds-*
 *   --tracking-{tight,normal,wide,...} → --tracking-ds-*
 *   --spacing-{01..13, *-gap, page-x, ...} → --spacing-ds-*
 *   --radius-default  → --radius            (bare `rounded` util)
 *   --radius-{sm,md,lg,xl,2xl,full,none} → --radius-ds-*
 *
 * Token files have already been rewritten by hand (they can't all be
 * captured safely by regex). This script sweeps .tsx/.ts/.css/.mjs/.js
 * consumers of those vars to match.
 *
 * Skipped: stories, tests, and the already-rewritten token files.
 * Idempotent: running twice is a no-op.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const ROOT = resolve(__dirname, '..')

const SCAN_ROOTS = [
  'packages/core/src',
  'apps',
]
const SKIP = [
  /\.stories\./,
  /\.test\./,
  /__tests__/,
  /tokens\/primitives\.css$/,
  /tokens\/semantic\.css$/,
  /tokens\/typography-semantic\.css$/,
]

const RENAMES = [
  [/var\(--font-size-([0-9a-z-]+)/g,  'var(--text-ds-$1'],
  [/var\(--line-height-([0-9a-z-]+)/g, 'var(--leading-ds-$1'],
  [/var\(--tracking-(tighter|tight|normal|wide|wider|widest)\b/g, 'var(--tracking-ds-$1'],
  [/var\(--spacing-(01|02b|02|03|04|05b|05|06b|06|07|08|09|1[0-3]|page-x|page-y|section-gap|card-gap|stack-gap)\b/g, 'var(--spacing-ds-$1'],
  [/var\(--radius-default\)/g, 'var(--radius)'],
  [/var\(--radius-(sm|md|lg|xl|2xl|full|none)\b/g, 'var(--radius-ds-$1'],
]

function walk(dir) {
  const results = []
  let entries
  try { entries = readdirSync(dir) } catch { return results }
  for (const e of entries) {
    const p = join(dir, e)
    let s
    try { s = statSync(p) } catch { continue }
    if (s.isDirectory()) {
      if (e === 'node_modules' || e === 'dist' || e === '.next') continue
      results.push(...walk(p))
    } else if (/\.(tsx|ts|css|mjs|js)$/.test(e)) {
      results.push(p)
    }
  }
  return results
}

let changedFiles = 0
let totalEdits = 0

for (const root of SCAN_ROOTS) {
  const absRoot = join(ROOT, root)
  for (const file of walk(absRoot)) {
    const rel = file.slice(ROOT.length + 1).split('\\').join('/')
    if (SKIP.some(r => r.test(rel))) continue

    let content
    try { content = readFileSync(file, 'utf8') } catch { continue }

    let edited = content
    let edits = 0
    for (const [pat, repl] of RENAMES) {
      const before = edited
      edited = edited.replace(pat, repl)
      if (edited !== before) {
        // count how many replacements happened
        const matches = before.match(pat)
        edits += matches ? matches.length : 0
      }
    }
    if (edited !== content) {
      writeFileSync(file, edited)
      changedFiles++
      totalEdits += edits
      console.log(`  ${rel}: ${edits} refs`)
    }
  }
}

console.log(`\nDone: ${changedFiles} files, ${totalEdits} replacements`)
