#!/usr/bin/env node

/**
 * fix-exports-types-ordering.mjs
 *
 * Fixes a correctness bug in `packages/core/package.json`'s `exports` field
 * that has shipped since the package was first published:
 *
 * ## The bug
 *
 * Every subpath export currently looks like this:
 *
 *   "./ui/button": {
 *     "import": "./dist/ui/button.js",
 *     "default": "./dist/ui/button.js",
 *     "types": "./dist/ui/button.d.ts"
 *   }
 *
 * Both Node's ESM resolver and TypeScript 5.x (`moduleResolution: "bundler"` or
 * `"node16"`) resolve `exports` conditions TOP-DOWN. When `"types"` sits after
 * `"import"` / `"default"`, consumers matching those conditions first never
 * reach `"types"` — TS silently falls back to the `.js` path for types, losing
 * intellisense, prop autocomplete, and (for re-exports of external types like
 * `VariantProps<typeof buttonVariants>`) type resolution entirely.
 *
 * Per the Node.js and TS docs, `"types"` MUST come first in every subpath's
 * condition map.
 *
 * ## The fix
 *
 * Reorder every subpath's condition block so `"types"` is the first key.
 * Preserve all other keys and their values. Preserve the outer ordering of
 * subpaths.
 *
 * ## Usage
 *
 *   node scripts/fix-exports-types-ordering.mjs        # writes the fix
 *   node scripts/fix-exports-types-ordering.mjs --dry  # prints diff, exits
 *
 * Idempotent. Running twice is a no-op.
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PKG_PATH = join(ROOT, 'packages/core/package.json')

const DRY = process.argv.includes('--dry')

// Parse while preserving numbers/strings — simple JSON is sufficient here.
const original = readFileSync(PKG_PATH, 'utf8')
const pkg = JSON.parse(original)

if (!pkg.exports || typeof pkg.exports !== 'object') {
  console.error('fix-exports: package.json has no exports object. Nothing to do.')
  process.exit(1)
}

let reordered = 0
let alreadyCorrect = 0
let stringExport = 0
let skipped = 0

for (const [subpath, entry] of Object.entries(pkg.exports)) {
  // String entries like `"./tokens": "./dist/tokens/index.css"` are unchanged.
  if (typeof entry === 'string') {
    stringExport++
    continue
  }
  if (entry == null || typeof entry !== 'object') {
    skipped++
    continue
  }

  const keys = Object.keys(entry)
  // Skip entries that don't declare `types` at all (no TS to reorder).
  if (!keys.includes('types')) {
    skipped++
    continue
  }
  // Already correct: `types` is first.
  if (keys[0] === 'types') {
    alreadyCorrect++
    continue
  }

  // Rebuild with types first, preserving the relative order of the other keys.
  const fixed = { types: entry.types }
  for (const k of keys) {
    if (k === 'types') continue
    fixed[k] = entry[k]
  }
  pkg.exports[subpath] = fixed
  reordered++
}

const updated = JSON.stringify(pkg, null, 2) + '\n'

console.log(`fix-exports-types-ordering: scanned ${Object.keys(pkg.exports).length} entries`)
console.log(`  reordered:      ${reordered}`)
console.log(`  already correct: ${alreadyCorrect}`)
console.log(`  string exports:  ${stringExport} (unchanged)`)
console.log(`  skipped:         ${skipped} (no types key)`)

if (updated === original) {
  console.log('\nNo changes needed.')
  process.exit(0)
}

if (DRY) {
  console.log('\n--dry: would have written changes. Run without --dry to apply.')
  process.exit(0)
}

writeFileSync(PKG_PATH, updated)
console.log('\nWrote packages/core/package.json')
