#!/usr/bin/env node
/**
 * audit-dts.mjs
 *
 * Publish gate for the CONSUMER-FACING correctness of our emitted declaration
 * files. Three assertions over packages/core/dist/**\/*.d.ts:
 *
 *   1. NO DIRECTIVE PROLOGUE — a `.d.ts` is an ambient context, so a leading
 *      `"use client"` is a statement and every consumer with
 *      `skipLibCheck: false` gets `error TS1036: Statements are not allowed in
 *      ambient contexts`.
 *
 *   2. NO UNDECLARED BARE SPECIFIER — every package named in a .d.ts must be a
 *      declared dependency or peerDependency. A module can be BUNDLED at
 *      runtime and still be named in our types (rollup inlines the JS; the
 *      TypeScript declaration emitter does not inline third-party types), so
 *      "it's bundled" is not evidence it can be left undeclared. Undeclared
 *      means `error TS2307: Cannot find module` for the consumer.
 *
 *   3. NO EXTENSIONLESS RELATIVE SPECIFIER — under `moduleResolution:
 *      "node16" | "nodenext"` an ECMAScript import needs an explicit
 *      extension, or the consumer gets TS2834/TS2835.
 *
 * WHY THIS GATE EXISTS
 * --------------------
 * 0.54.0 shipped all three faults at once — 209 .d.ts with a directive
 * prologue, 8 with undeclared type imports (@tiptap/*, @floating-ui/dom), and
 * 234 extensionless specifiers. A single barrel import produced 78 errors.
 * None of the 45 existing gates saw it, because our own consumer smoke test
 * had `skipLibCheck: true` — the setting that suppresses exactly this class.
 *
 * All three are invisible on the most common consumer config (`bundler` +
 * `skipLibCheck: true`), which is why they must be asserted mechanically
 * rather than noticed.
 *
 * Usage:
 *   node scripts/audit-dts.mjs                 # exit 1 on any violation
 *   node scripts/audit-dts.mjs --json          # machine-readable findings
 *   node scripts/audit-dts.mjs --root <dir>    # audit an installed/extracted
 *                                              # package instead of our dist
 *
 * `--root` exists so the gate itself is testable: point it at a published
 * tarball to confirm it still detects a known-bad release.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const asJson = process.argv.includes('--json')
const rootFlag = process.argv.indexOf('--root')
const coreRoot =
  rootFlag !== -1 && process.argv[rootFlag + 1]
    ? process.argv[rootFlag + 1]
    : join(__dirname, '..', 'packages', 'core')
const distRoot = join(coreRoot, 'dist')

if (!existsSync(distRoot)) {
  console.error(`audit-dts: ${distRoot} not found — run the build first.`)
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(coreRoot, 'package.json'), 'utf8'))
const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  // Always resolvable in any React consumer; react-dom is a required peer.
  'react',
  'react-dom',
])

/**
 * Strip comments before scanning. Without this the audit trips over prose and
 * `@example` blocks — a JSDoc line reading `import { X } from '@scope/pkg'` is
 * documentation, not a dependency, and `@module @devalok/shilp-sutra/ui` is a
 * tag. Both produced false positives in the ad-hoc version of this scan.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const HAS_EXTENSION = /\.(js|mjs|cjs|json|css|d\.ts)$/
const SPECIFIER_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g

function moduleRoot(spec) {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (full.endsWith('.d.ts')) acc.push(full)
  }
  return acc
}

const files = walk(distRoot)
const findings = { directive: [], undeclared: [], extensionless: [] }

for (const file of files) {
  const rel = file.slice(distRoot.length + 1).split('\\').join('/')
  const raw = readFileSync(file, 'utf8')

  if (/^\s*["']use (client|server)["']/.test(raw)) findings.directive.push(rel)

  const code = stripComments(raw)
  for (const m of code.matchAll(SPECIFIER_RE)) {
    const spec = m[1]
    if (spec.startsWith('.')) {
      if (!HAS_EXTENSION.test(spec)) findings.extensionless.push(`${rel} → ${spec}`)
      continue
    }
    if (spec.startsWith('node:')) continue
    const root = moduleRoot(spec)
    if (!declared.has(root)) findings.undeclared.push(`${rel} → ${root}`)
  }
}

const total =
  findings.directive.length + findings.undeclared.length + findings.extensionless.length

if (asJson) {
  console.log(JSON.stringify({ scanned: files.length, total, findings }, null, 2))
  process.exit(total ? 1 : 0)
}

console.log(`# audit-dts\n\nScanned ${files.length} declaration files in ${distRoot}.\n`)

const report = (label, items, hint) => {
  if (!items.length) {
    console.log(`✓ ${label}`)
    return
  }
  console.log(`\n✗ ${label} — ${items.length} violation(s):`)
  for (const i of items.slice(0, 25)) console.log(`    ${i}`)
  if (items.length > 25) console.log(`    … and ${items.length - 25} more`)
  console.log(`  ${hint}`)
}

report(
  'No directive prologue in .d.ts',
  findings.directive,
  'Fix: inject-use-client.mjs must skip .d.ts (TS1036 for skipLibCheck:false consumers).'
)
report(
  'Every bare specifier is a declared dep/peer',
  [...new Set(findings.undeclared)],
  'Fix: declare it (optional peer if types-only), or stop exposing the type. TS2307 otherwise.'
)
report(
  'No extensionless relative specifiers',
  findings.extensionless,
  'Fix: fix-dts-extensions.mjs must run in post-build (TS2834/TS2835 under node16/nodenext).'
)

if (total) {
  console.log(`\naudit-dts: FAILED — ${total} violation(s).`)
  process.exit(1)
}
console.log('\naudit-dts: PASSED.')
