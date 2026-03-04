#!/usr/bin/env node
/**
 * check-props-exports.mjs
 *
 * CI lint script: verifies that every `export interface *Props` and
 * `export type *Props` declared in src/ui/*.tsx (flat, no subdirs) is
 * re-exported from src/ui/index.ts.
 *
 * Intentionally excluded (internal sub-component props):
 *   - SegmentedControlItemProps  (used only inside SegmentedControl)
 *   - Any name starting with a lowercase letter (non-public utility types)
 *
 * Exit codes:
 *   0 -- all Props accounted for
 *   1 -- one or more Props missing from the barrel
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const UI_DIR = path.join(ROOT, 'src', 'ui')
const INDEX_FILE = path.join(UI_DIR, 'index.ts')

// Props names that are intentionally NOT re-exported (internal sub-components)
const EXCLUDED = new Set(['SegmentedControlItemProps'])

// Match: export interface FooProps, export type FooProps
const PROPS_REGEX = /export\s+(?:interface|type)\s+(\w+Props)\b/g

// 1. Read barrel
const indexContent = fs.readFileSync(INDEX_FILE, 'utf8')

// 2. Scan flat src/ui/*.tsx (skip *.stories.tsx and *.test.tsx)
const entries = fs.readdirSync(UI_DIR, { withFileTypes: true })
const sourceFiles = entries
  .filter(
    (e) =>
      e.isFile() &&
      e.name.endsWith('.tsx') &&
      !e.name.endsWith('.stories.tsx') &&
      !e.name.endsWith('.test.tsx')
  )
  .map((e) => path.join(UI_DIR, e.name))

// 3. Collect all *Props names with their source file
const allProps = []

for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, 'utf8')
  let match
  PROPS_REGEX.lastIndex = 0
  while ((match = PROPS_REGEX.exec(content)) !== null) {
    const name = match[1]
    // Skip excluded internal types
    if (EXCLUDED.has(name)) continue
    // Skip names starting with a lowercase letter (non-public utility types)
    if (/^[a-z]/.test(name)) continue
    // Normalise to forward slashes for cross-platform display
    const relFile = path.relative(ROOT, filePath).split(path.sep).join('/')
    allProps.push({ name, file: relFile })
  }
}

// 4. Check each name is present in index.ts
// Lookaround assertion avoids false positives where a name is a suffix of
// another export (e.g. ButtonProps inside IconButtonProps).
const missing = []

for (const { name, file } of allProps) {
  const namePattern = new RegExp('(?<![a-zA-Z0-9_])' + name + '(?![a-zA-Z0-9_])')
  if (!namePattern.test(indexContent)) {
    missing.push({ name, file })
  }
}

// 5. Report
if (missing.length === 0) {
  console.log('✓ Props export check passed (' + allProps.length + ' types verified)')
  process.exit(0)
} else {
  console.error('✗ Props export check failed:')
  console.error('  Missing in src/ui/index.ts:')
  for (const { name, file } of missing) {
    console.error('    - ' + name + ' (' + file + ')')
  }
  console.error('  Add these to src/ui/index.ts to fix.')
  process.exit(1)
}
