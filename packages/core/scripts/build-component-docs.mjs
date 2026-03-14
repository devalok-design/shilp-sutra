/**
 * build-component-docs.mjs
 *
 * Scans src/ui/, src/composed/, src/shell/ for component source files,
 * validates that each has a matching doc in docs/components/{category}/{kebab-name}.md,
 * and concatenates all docs into llms-full.txt.
 *
 * Usage (run from packages/core/):
 *   node scripts/build-component-docs.mjs          # validate + generate
 *   node scripts/build-component-docs.mjs --check   # validate only (no file write)
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// ── Configuration ───────────────────────────────────────────────────────────

const CATEGORIES = ['ui', 'composed', 'shell']

/** Directories to skip when scanning for components. */
const SKIP_DIRS = new Set(['lib', '__tests__', 'extensions', '_internal'])

/** File patterns to exclude. */
function isExcluded(filename) {
  if (filename.endsWith('.js')) return true
  if (filename.endsWith('.test.tsx') || filename.endsWith('.test.ts')) return true
  if (filename.endsWith('.stories.tsx') || filename.endsWith('.stories.ts')) return true
  if (filename.endsWith('.mdx')) return true
  if (filename === 'index.ts' || filename === 'index.tsx') return true
  if (filename.endsWith('-types.ts') || filename.endsWith('-types.tsx')) return true
  return false
}

// ── Component scanning ──────────────────────────────────────────────────────

/**
 * Collect kebab-names of components in a category directory.
 * Scans .tsx files at the top level and recurses into subdirectories
 * (skipping SKIP_DIRS). Returns sorted unique names.
 */
function scanComponents(categoryDir) {
  const names = []

  function scan(dir) {
    let entries
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(entry)) continue
        scan(fullPath)
        continue
      }

      // Only .tsx component files
      if (!entry.endsWith('.tsx')) continue
      if (isExcluded(entry)) continue

      const name = basename(entry, extname(entry))
      names.push(name)
    }
  }

  scan(categoryDir)
  return [...new Set(names)].sort()
}

// ── Section separators ──────────────────────────────────────────────────────

const SECTION_SEPARATORS = {
  ui: `\n---\n\n# UI COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/ui/<kebab-name>\n\n---\n\n`,
  composed: `\n---\n\n# COMPOSED COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/composed/<kebab-name>\n\n---\n\n`,
  shell: `\n---\n\n# SHELL COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/shell/<kebab-name>\n\n---\n\n`,
}

// ── Main ────────────────────────────────────────────────────────────────────

const checkOnly = process.argv.includes('--check')

// Read version from package.json
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const version = pkg.version

// Scan all categories for component names
const componentsByCategory = {}
for (const cat of CATEGORIES) {
  componentsByCategory[cat] = scanComponents(join(ROOT, 'src', cat))
}

// Validate: every component must have a matching doc file
const missing = []
for (const cat of CATEGORIES) {
  for (const name of componentsByCategory[cat]) {
    const docPath = join(ROOT, 'docs', 'components', cat, `${name}.md`)
    try {
      statSync(docPath)
    } catch {
      missing.push(`docs/components/${cat}/${name}.md`)
    }
  }
}

if (missing.length > 0) {
  const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
  console.error(`\nMissing ${missing.length} of ${total} component doc files:\n`)
  for (const m of missing) {
    console.error(`  - ${m}`)
  }
  console.error('')
  process.exit(1)
}

// In --check mode, just report success
if (checkOnly) {
  const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
  console.log(`All ${total} component doc files present.`)
  process.exit(0)
}

// Concatenate all docs into llms-full.txt
const parts = []

// Header with version replacement
const header = readFileSync(join(ROOT, 'docs', 'components', '_header.md'), 'utf8')
parts.push(header.replace('{{VERSION}}', version))

for (const cat of CATEGORIES) {
  parts.push(SECTION_SEPARATORS[cat])

  const docDir = join(ROOT, 'docs', 'components', cat)
  const names = componentsByCategory[cat]

  for (const name of names) {
    const content = readFileSync(join(docDir, `${name}.md`), 'utf8')
    parts.push(content)
    // Ensure a blank line between docs
    if (!content.endsWith('\n')) {
      parts.push('\n')
    }
  }
}

const output = parts.join('')
writeFileSync(join(ROOT, 'llms-full.txt'), output, 'utf8')

const total = CATEGORIES.reduce((n, c) => n + componentsByCategory[c].length, 0)
console.log(`llms-full.txt generated — ${total} components across ${CATEGORIES.length} categories.`)
