#!/usr/bin/env node
/**
 * One-shot: inject a placeholder "## Composability" section into any
 * component doc that doesn't have one. Section goes right before the
 * first existing "## Gotchas" heading (or "## Changes" if no Gotchas).
 *
 * Usage:
 *   node scripts/inject-composability-stub.mjs
 *
 * This writes a `<!-- composability-stub -->` marker so we can find
 * and refine stubs in follow-up passes.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS = join(HERE, '..', 'docs', 'components')

const CATS = ['ui', 'composed', 'shell']

const STUB = `## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

`

let touched = 0
let skipped = 0

for (const cat of CATS) {
  const dir = join(DOCS, cat)
  let entries
  try {
    entries = readdirSync(dir)
  } catch { continue }
  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue
    const path = join(dir, entry)
    const src = readFileSync(path, 'utf8')
    if (/^## Composability/m.test(src)) {
      skipped++
      continue
    }

    // Find where to inject: before ## Gotchas, or before ## Changes, or at end.
    let out
    if (/^## Gotchas\s*$/m.test(src)) {
      out = src.replace(/^## Gotchas\s*$/m, `${STUB}## Gotchas`)
    } else if (/^## Changes\s*$/m.test(src)) {
      out = src.replace(/^## Changes\s*$/m, `${STUB}## Changes`)
    } else {
      // Append at end
      out = src.replace(/\s*$/, `\n\n${STUB}`)
    }
    writeFileSync(path, out, 'utf8')
    touched++
    console.log(`  + ${cat}/${entry}`)
  }
}

console.log(`\nInjected stubs: ${touched}  |  Already had Composability: ${skipped}`)
