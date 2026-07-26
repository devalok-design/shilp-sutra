/**
 * fix-empty-modules.mjs
 *
 * Post-build script that gives every 0-byte emitted `.js` module an explicit
 * `export {}` body.
 *
 * WHY
 * ---
 * A types-only entry point (`ui/toast-types`, `ai/types`) has no runtime
 * content, so the bundler emits an empty file — while `package.json#exports`
 * still advertises a runtime `import` condition for it. An empty file contains
 * no syntax for Node's module-type detection to look at, so it is ambiguous
 * between ESM and CJS. Under pnpm's symlinked `node_modules`, resolving that
 * ambiguity through the realpath makes Node believe it is being `require()`d
 * from inside its own graph:
 *
 *   ERR_REQUIRE_CYCLE_MODULE: Cannot require() ES Module … in a cycle.
 *
 * So `import '@devalok/shilp-sutra/ui/toast-types'` throws for pnpm consumers
 * while working fine under npm, whose flat layout avoids the symlink hop. The
 * fault predates this script — published 0.54.0 fails the same way — and is
 * invisible to any npm-based test.
 *
 * `export {}` is the minimum body that makes the file unambiguously an ES
 * module. It adds no runtime behaviour and no exports.
 *
 * Run from packages/core/ after the bundle is emitted:
 *   node scripts/fix-empty-modules.mjs
 */

import { readdirSync, statSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distRoot = join(__dirname, '..', 'dist')

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (full.endsWith('.js') && st.size === 0) acc.push(full)
  }
  return acc
}

const empties = walk(distRoot)
for (const file of empties) {
  writeFileSync(file, 'export {};\n')
}

console.log(
  `fix-empty-modules: ${empties.length} empty module(s) given an explicit ESM body` +
    (empties.length ? ` — ${empties.map((f) => f.slice(distRoot.length + 1)).join(', ')}` : '')
)
