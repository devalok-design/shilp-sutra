#!/usr/bin/env node
/**
 * check-props-exports.mjs
 *
 * CI lint script: verifies that every public `*Props` type declared under
 * packages/core/src is REACHABLE FROM A PUBLISHED ENTRY POINT -- that is, that
 * an application which installs this package can actually import it.
 *
 * WHY THIS REPLACED THE BARREL CHECK (2026-10-09)
 * -----------------------------------------------
 * The previous version asked "is this type named in the index.ts of its own
 * directory?". That is a proxy for importability, and it is wrong in BOTH
 * directions:
 *
 *   FALSE POSITIVE -- LinkProviderProps lives in src/ui/lib/link-context.tsx and
 *   is re-exported by src/shell/index.ts, which IS a published entry (./shell).
 *   Consumers could always import it. The old check failed it anyway, because
 *   src/ui/lib has no index.ts.
 *
 *   FALSE NEGATIVE -- the worse one. Between 2026-03-14 and 2026-09-30 a file
 *   src/ui/lib/index.ts existed and the old check passed, reporting
 *   "133 types verified". But `./ui/lib` was never in package.json exports, and
 *   vite.config.ts explicitEntries lists only ui/lib/{utils,motion,date-utils} --
 *   so that barrel was never built and never shipped. For six months the check
 *   was GREEN on BottomSheetProps, a type no consumer could import. Deleting the
 *   dead barrel did not break the check; it removed the prop holding up a check
 *   that was not measuring anything real.
 *
 * So the question is not "is it in a barrel" but "can someone import it". This
 * script answers that one: it resolves package.json `exports` to source files,
 * walks re-exports transitively from each published entry, and asserts every
 * public *Props name appears somewhere in that reachable set.
 *
 * A side effect worth knowing: EXCLUDED_FILES is gone. data-table, input-otp,
 * toast and toaster needed exclusion under the old model because they are not in
 * the /ui barrel. Under this model they are reachable via their own subpaths
 * (./ui/data-table and friends), so they simply pass. Needing no exclusion list
 * is evidence the model is the right one.
 *
 * Skipped files: *.stories.tsx, *.test.tsx, __tests__/
 * Skipped names: any name starting with a lowercase letter (non-public types)
 *
 * Exit codes:
 *   0 -- every public *Props is reachable from a published entry point
 *   1 -- one or more are unreachable (nothing can import them)
 *   2 -- the script could not run (bad package.json, missing entry source)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const PKG_DIR = path.join(REPO_ROOT, 'packages', 'core')
const SRC_DIR = path.join(PKG_DIR, 'src')
const UI_DIR = path.join(SRC_DIR, 'ui')

const PROPS_PATTERN = /export\s+(?:interface|type)\s+(\w+Props)\b/g

/**
 * Types that are genuinely unreachable and knowingly left that way, each with
 * the issue tracking the decision. An entry here WARNS on every run rather than
 * failing -- the debt stays loud instead of disappearing into a passing build.
 *
 * Do not add to this list to make a build green. Adding a row is a decision to
 * ship a type nobody can import, and it needs an issue saying why.
 */
const KNOWN_UNREACHABLE = new Map([
  ['BottomSheetProps', 'devalok-design/shilp-sutra#327'],
])

function fail(msg) {
  console.error('check-props-exports: ' + msg)
  process.exit(2)
}

/* ---------------------------------------------------------------- entries -- */

/**
 * Map a published dist target back to its source file.
 * './dist/ui/lib/utils.js' -> '<pkg>/src/ui/lib/utils.ts'
 * Returns null when no source file exists (a stale exports entry).
 */
function distToSource(target) {
  if (typeof target !== 'string') return null
  const rel = target.replace(/^\.\//, '').replace(/^dist\//, '')
  const base = path.join(SRC_DIR, rel.replace(/\.(js|d\.ts)$/, ''))
  for (const ext of ['.ts', '.tsx']) {
    if (fs.existsSync(base + ext)) return base + ext
  }
  for (const ext of ['.ts', '.tsx']) {
    const idx = path.join(base, 'index' + ext)
    if (fs.existsSync(idx)) return idx
  }
  return null
}

function collectEntrySources() {
  const pkgPath = path.join(PKG_DIR, 'package.json')
  if (!fs.existsSync(pkgPath)) fail('no package.json at ' + pkgPath)
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  } catch (e) {
    fail('package.json is not valid JSON: ' + e.message)
  }
  if (!pkg.exports) fail('package.json has no "exports" map')

  const sources = new Set()
  const unresolved = []
  for (const [subpath, value] of Object.entries(pkg.exports)) {
    // Each value is either a string or a conditions object; prefer "types".
    const target =
      typeof value === 'string' ? value : value && (value.types || value.import || value.default)
    const src = distToSource(target)
    if (src) sources.add(src)
    // Only a CODE entry that fails to resolve is worth reporting. The package
    // also exports css, json, fonts, docs and the make-kit; those have no source
    // module behind them and are not stale.
    else if (target && /\.(js|d\.ts)$/.test(target)) {
      unresolved.push(subpath + ' -> ' + target)
    }
  }
  return { sources, unresolved }
}

/* ------------------------------------------------------------- resolution -- */

/** Resolve a relative import specifier from `fromFile` to a real source file. */
function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null // package import, not our graph
  const base = path.resolve(path.dirname(fromFile), spec)
  for (const ext of ['.ts', '.tsx']) {
    if (fs.existsSync(base + ext)) return base + ext
  }
  for (const ext of ['.ts', '.tsx']) {
    const idx = path.join(base, 'index' + ext)
    if (fs.existsSync(idx)) return idx
  }
  return null
}

/**
 * Names a single file exports, plus the files it re-exports from.
 * Returns { names:Set<string>, starFrom:string[], namedFrom:[{file,names}] }
 */
function readExports(file) {
  const src = fs.readFileSync(file, 'utf8')
  const names = new Set()
  const starFrom = []

  // export * from './x'   /   export * as Ns from './x'
  for (const m of src.matchAll(/export\s+\*(?:\s+as\s+(\w+))?\s+from\s+['"]([^'"]+)['"]/g)) {
    if (m[1]) names.add(m[1])
    else {
      const target = resolveSpec(file, m[2])
      if (target) starFrom.push(target)
    }
  }

  // export { a, type B, c as D } from './x'   and   export { a, type B }
  for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?/g)) {
    for (let piece of m[1].split(',')) {
      piece = piece.trim()
      if (!piece) continue
      piece = piece.replace(/^type\s+/, '')
      const asMatch = piece.match(/^(\S+)\s+as\s+(\S+)$/)
      names.add(asMatch ? asMatch[2] : piece)
    }
    // A re-export from a module still only publishes the names listed above,
    // so the target file does not need walking for THIS statement.
  }

  // Locally declared exports of every kind.
  for (const m of src.matchAll(
    /export\s+(?:declare\s+)?(?:abstract\s+)?(?:interface|type|const|let|var|function|class|enum)\s+(\w+)/g,
  )) {
    names.add(m[1])
  }

  return { names, starFrom }
}

/** Every name importable from any published entry point. */
function reachableNames(entrySources) {
  const seen = new Set()
  const out = new Set()
  const queue = [...entrySources]
  while (queue.length) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)
    let r
    try {
      r = readExports(file)
    } catch {
      continue
    }
    for (const n of r.names) out.add(n)
    // `export *` re-publishes everything the target exports, so follow it.
    for (const t of r.starFrom) if (!seen.has(t)) queue.push(t)
  }
  return out
}

/* ------------------------------------------------------------------ scan -- */

function collectTsx(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue
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

/* ------------------------------------------------------------------ main -- */

const { sources: entrySources, unresolved } = collectEntrySources()
if (entrySources.size === 0) fail('no exports entry resolved to a source file')

const reachable = reachableNames(entrySources)

const allProps = []
const missing = []
const known = []

for (const filePath of collectTsx(UI_DIR)) {
  const content = fs.readFileSync(filePath, 'utf8')
  const relFile = path.relative(REPO_ROOT, filePath).split(path.sep).join('/')
  for (const match of content.matchAll(PROPS_PATTERN)) {
    const name = match[1]
    if (/^[a-z]/.test(name)) continue
    allProps.push({ name, file: relFile })
    if (reachable.has(name)) continue
    if (KNOWN_UNREACHABLE.has(name)) known.push({ name, file: relFile, issue: KNOWN_UNREACHABLE.get(name) })
    else missing.push({ name, file: relFile })
  }
}

if (unresolved.length) {
  console.warn(
    'check-props-exports: ' +
      unresolved.length +
      ' code export' +
      (unresolved.length === 1 ? '' : 's') +
      ' resolved to no source file (stale exports entry?):',
  )
  for (const u of unresolved) console.warn('  - ' + u)
}

// Known-unreachable types are reported every run, deliberately. A green build
// should still say out loud that it is shipping a type nobody can import.
if (known.length) {
  console.warn(
    '! ' + known.length + ' type' + (known.length === 1 ? ' is' : 's are') +
      ' knowingly unreachable (tracked, not failing):',
  )
  for (const { name, file, issue } of known) {
    console.warn('  - ' + name + ' (' + file + ')  ' + issue)
  }
}

if (missing.length === 0) {
  console.log(
    '✓ Props export check passed (' +
      (allProps.length - known.length) +
      ' of ' +
      allProps.length +
      ' types reachable from ' +
      entrySources.size +
      ' published entry points)',
  )
  process.exit(0)
}

console.error('✗ Props export check failed -- these types cannot be imported by any consumer:')
for (const { name, file } of missing) {
  console.error('  - ' + name + ' (' + file + ')')
}
console.error(
  '\nFix by either: re-exporting the type from an existing published entry point,' +
    '\nor adding a new subpath to packages/core/package.json "exports" (and a matching' +
    '\nvite.config.ts entry, or the build will not emit it).',
)
process.exit(1)
