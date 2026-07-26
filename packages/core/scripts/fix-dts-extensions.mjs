/**
 * fix-dts-extensions.mjs
 *
 * Post-build script that rewrites relative import specifiers in dist/**\/*.d.ts
 * to carry an explicit `.js` extension:
 *
 *   export { Button } from './button'        →  from './button.js'
 *   export * from './chat'                   →  from './chat/index.js'
 *   import type { X } from '../primitives/y' →  from '../primitives/y.js'
 *
 * WHY
 * ---
 * Under `"moduleResolution": "node16" | "nodenext"`, ECMAScript imports require
 * explicit file extensions. Extensionless relative specifiers in a declaration
 * file are a hard error for those consumers:
 *
 *   error TS2835: Relative import paths need explicit file extensions in
 *     ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'.
 *   error TS2834: Relative import paths need explicit file extensions …
 *
 * 0.54.0 published 234 such specifiers, so a single barrel import under
 * nodenext + `skipLibCheck: false` produced 79 errors. `moduleResolution:
 * "bundler"` (Vite/Next default) tolerates extensionless paths, which is why
 * this went unnoticed — the failure is invisible on the most common config.
 *
 * The extension is `.js`, NOT `.d.ts`: a declaration file describes the runtime
 * module graph, and TypeScript maps `./button.js` to `./button.d.ts` itself.
 * Writing `.d.ts` here would be wrong and would not resolve.
 *
 * Directory specifiers must become explicit `/index.js` — node16 resolution
 * performs no directory-index lookup. That is why this script resolves every
 * specifier against the real emitted files rather than blindly appending.
 *
 * Run from packages/core/ AFTER fix-dts-primitives (which rewrites the
 * `@primitives/*` alias into relative paths that also need extensions):
 *   node scripts/fix-dts-extensions.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distRoot = join(__dirname, '..', 'dist')

/** Extensions that are already explicit — never touch these. */
const HAS_EXTENSION = /\.(js|mjs|cjs|json|css|d\.ts)$/

/**
 * Matches the specifier of any module reference a .d.ts can contain:
 *   import … from '…' / export … from '…' / import('…') / import '…'
 * Capture groups: 1 = leading syntax up to the quote, 2 = quote, 3 = specifier.
 */
const SPECIFIER_RE =
  /((?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"]))([^'"]+)\2/g

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (full.endsWith('.d.ts')) acc.push(full)
  }
  return acc
}

/**
 * Resolve an extensionless relative specifier against the emitted files.
 * @returns the rewritten specifier, or null when nothing on disk matches.
 */
function resolveSpecifier(fromFile, spec) {
  const base = join(dirname(fromFile), spec)
  if (existsSync(`${base}.d.ts`)) return `${spec}.js`
  if (existsSync(join(base, 'index.d.ts'))) return `${spec.replace(/\/$/, '')}/index.js`
  return null
}

const files = walk(distRoot)
let rewritten = 0
let filesTouched = 0
const unresolved = []

/**
 * Byte offsets of every comment, so import-looking text inside a JSDoc
 * `@example` is left alone. Without this the script tries to resolve
 * documentation (`* import { normalizeIcon } from './lib/normalize-icon'`)
 * against the emit and warns about it on every build.
 */
function commentRanges(src) {
  const ranges = []
  for (const m of src.matchAll(/\/\*[\s\S]*?\*\//g)) ranges.push([m.index, m.index + m[0].length])
  for (const m of src.matchAll(/(^|[^:])\/\/.*$/gm)) ranges.push([m.index, m.index + m[0].length])
  return ranges
}

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  let changed = false
  const comments = commentRanges(src)
  const inComment = (i) => comments.some(([a, b]) => i >= a && i < b)

  const out = src.replace(SPECIFIER_RE, (match, lead, quote, spec, offset) => {
    if (inComment(offset)) return match // documentation, not an import
    if (!spec.startsWith('.')) return match // bare / package specifier
    if (HAS_EXTENSION.test(spec)) return match // already explicit

    const next = resolveSpecifier(file, spec)
    if (!next) {
      unresolved.push(`${file.slice(distRoot.length + 1)} → ${spec}`)
      return match
    }
    changed = true
    rewritten++
    return `${lead}${next}${quote}`
  })

  if (changed) {
    writeFileSync(file, out)
    filesTouched++
  }
}

if (unresolved.length) {
  // Not fatal on its own — an unresolvable relative specifier is already broken
  // regardless of extension — but it always means the emit is wrong somewhere.
  console.warn(
    `fix-dts-extensions: WARNING — ${unresolved.length} relative specifier(s) matched no emitted file:`
  )
  for (const u of unresolved.slice(0, 20)) console.warn(`  ${u}`)
  if (unresolved.length > 20) console.warn(`  … and ${unresolved.length - 20} more`)
}

console.log(
  `fix-dts-extensions: ${rewritten} specifier(s) given explicit extensions across ${filesTouched}/${files.length} .d.ts files`
)
