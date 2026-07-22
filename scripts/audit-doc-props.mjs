#!/usr/bin/env node
/**
 * audit-doc-props.mjs  (ADVISORY)
 *
 * The CVA-accuracy gate (audit-component-docs.mjs) only checks VARIANT/enum
 * axes. Non-variant props a doc documents (booleans, strings, callbacks) are
 * unchecked — a doc can keep documenting a prop that source removed, and the
 * MCP serves it.
 *
 * This flags, per component, any prop the DOC documents whose name does not
 * appear anywhere in the component's source file(s) — i.e. a prop that was
 * likely renamed/removed but left in the doc. It deliberately does NOT flag the
 * reverse (source props absent from the doc): components spread inherited HTML
 * attributes, so that direction is mostly noise.
 *
 * ADVISORY: prints warnings, always exits 0. Heuristic (a prop name shared with
 * an unrelated identifier can hide a real removal) — it surfaces candidates for
 * human review, it does not block releases.
 *
 *   node scripts/audit-doc-props.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..', 'packages', 'core')
const manifest = JSON.parse(readFileSync(join(ROOT, 'mcp-manifest.json'), 'utf-8'))

// Props that are almost always inherited/passthrough — not worth flagging.
const COMMON = new Set(['className', 'children', 'style', 'id', 'ref', 'key', 'asChild', 'disabled', 'onClick'])

// A thin wrapper inherits its real prop surface from a vendored/Radix primitive
// via `ComponentProps<typeof X.Root>` / `ComponentPropsWithoutRef<typeof X>`, so
// those props never appear as literals in the wrapper's own source. Flagging
// them is a false positive (verified 2026-07: collapsible, radio, toggle,
// toggle-group, input-otp). Detect the signal and skip the component.
const PASSTHROUGH_SIGNAL = /ComponentProps(WithoutRef)?\s*<\s*typeof/

// Resolve a relative module specifier to an on-disk source file.
function resolveRel(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec)
  for (const cand of [`${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')]) {
    if (existsSync(cand)) return cand
  }
  return null
}

// Read a file plus the files it RE-EXPORTS from (`export … from './x'`). A
// re-export barrel (e.g. shell/link-context.tsx → ui/lib/link-context.tsx) IS
// that file's public API, so its props live one hop away. One level deep.
function readWithReexports(file, seen = new Set()) {
  if (seen.has(file)) return ''
  seen.add(file)
  let text = readFileSync(file, 'utf-8')
  for (const m of text.matchAll(/export\b[^;\n]*?from\s+['"](\.[^'"]+)['"]/g)) {
    const target = resolveRel(file, m[1])
    if (target) text += '\n' + readWithReexports(target, seen)
  }
  return text
}

function sourceText(tier, name) {
  // Component may be a single file or a directory of files.
  const file = join(ROOT, 'src', tier, `${name}.tsx`)
  if (existsSync(file)) return readWithReexports(file)
  const dir = join(ROOT, 'src', tier, name)
  if (existsSync(dir)) {
    let all = ''
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory()) walk(join(d, e.name))
        else if (/\.tsx?$/.test(e.name)) all += readFileSync(join(d, e.name), 'utf-8')
      }
    }
    walk(dir)
    return all
  }
  return null
}

let flagged = 0
let checked = 0
for (const [name, c] of Object.entries(manifest.components)) {
  const props = Object.keys(c.props || {})
  if (!props.length) continue
  const src = sourceText(c.tier, name)
  if (src == null) continue // no local source (vendored/aggregate) — skip
  checked++
  // Thin primitive wrapper — real props are inherited, not literal here. Skip.
  if (PASSTHROUGH_SIGNAL.test(src)) continue
  const orphans = props.filter(
    (p) =>
      /^[a-z][A-Za-z0-9]*$/.test(p) && // real props are camelCase-lowercase-first; drops parser artifacts ("Returns", "Multiple")
      !COMMON.has(p) &&
      !new RegExp(`\\b${p}\\b`).test(src)
  )
  if (orphans.length) {
    flagged++
    console.log(`  ⚠ [${name}] doc prop(s) not found in source: ${orphans.join(', ')}`)
  }
}

console.log(
  `audit-doc-props: checked ${checked} components; ${flagged} with doc-only prop(s). ADVISORY — does not block.\n` +
    '  Note: components that thin-wrap a vendored Radix primitive (Radio, Toggle, Collapsible, …) declare props via\n' +
    '  ComponentProps passthrough, so their real props are NOT literal in source and show here as false positives.\n' +
    '  Review for props that are genuinely REMOVED (renamed/deleted) but still documented.'
)
process.exit(0)
