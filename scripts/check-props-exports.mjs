#!/usr/bin/env node
/**
 * check-props-exports.mjs
 *
 * CI lint script: verifies that every `export interface *Props` and
 * `export type *Props` declared in src/ui/**\/*.tsx is re-exported by
 * the nearest barrel (index.ts in the same sub-directory, or src/ui/index.ts
 * for flat files).
 *
 * Sub-directory layout:
 *   - src/ui/*.tsx          → must appear in src/ui/index.ts
 *   - src/ui/charts/*.tsx   → must appear in src/ui/charts/index.ts
 *   - src/ui/tree-view/*.tsx → must appear in src/ui/tree-view/index.ts (etc.)
 *
 * Skipped files: *.stories.tsx, *.test.tsx
 * Skipped names: any name starting with a lowercase letter (non-public utility types)
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

// Match: export interface FooProps, export type FooProps
const PROPS_PATTERN = /export\s+(?:interface|type)\s+(\w+Props)\b/g

/** Cache of barrel file contents by directory path. */
const barrelCache = new Map()

function readBarrel(dir) {
  if (barrelCache.has(dir)) return barrelCache.get(dir)
  const indexPath = path.join(dir, 'index.ts')
  const content = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : ''
  barrelCache.set(dir, content)
  return content
}

/**
 * Recursively collect all *.tsx files (excluding *.stories.tsx and *.test.tsx)
 * under the given directory.
 */
function collectTsx(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      collectTsx(full, acc)
    } else if (
      e.name.endsWith('.tsx') &&
      !e.name.endsWith('.stories.tsx') &&
      !e.name.endsWith('.test.tsx')
    ) {
      acc.push(full)
    }
  }
  return acc
}

/** Check if `name` is present as a word boundary in `content`. */
function isExported(name, content) {
  const pattern = new RegExp('(?<![a-zA-Z0-9_])' + name + '(?![a-zA-Z0-9_])')
  return pattern.test(content)
}

// Scan all src/ui/**/*.tsx recursively
const sourceFiles = collectTsx(UI_DIR)

const allProps = []
const missing = []

for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, 'utf8')
  const fileDir = path.dirname(filePath)
  const relFile = path.relative(ROOT, filePath).split(path.sep).join('/')

  // Determine which barrel to check:
  //   - Files directly in src/ui/ → check src/ui/index.ts
  //   - Files in src/ui/subdir/   → check src/ui/subdir/index.ts
  const barrelDir = fileDir === UI_DIR ? UI_DIR : fileDir
  const barrelContent = readBarrel(barrelDir)

  const matches = [...content.matchAll(PROPS_PATTERN)]
  for (const match of matches) {
    const name = match[1]
    // Skip names starting with a lowercase letter (non-public utility types)
    if (/^[a-z]/.test(name)) continue

    allProps.push({ name, file: relFile })

    if (!isExported(name, barrelContent)) {
      missing.push({ name, file: relFile, barrel: path.relative(ROOT, path.join(barrelDir, 'index.ts')).split(path.sep).join('/') })
    }
  }
}

// Report
if (missing.length === 0) {
  console.log('✓ Props export check passed (' + allProps.length + ' types verified)')
  process.exit(0)
} else {
  console.error('✗ Props export check failed:')
  for (const { name, file, barrel } of missing) {
    console.error('  - ' + name + ' (' + file + ') not found in ' + barrel)
  }
  console.error('\nAdd each missing type to its barrel file to fix.')
  process.exit(1)
}
