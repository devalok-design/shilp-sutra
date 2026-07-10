#!/usr/bin/env node
/**
 * lint-doc-examples.mjs
 *
 * The MCP's `get_component` serves the `examples` authored in
 * docs/components/*.md (via mcp-manifest.json). Those examples are hand-written
 * and un-gated: when a prop/variant is renamed or removed, an old example keeps
 * shipping the dead API and the MCP hands it to agents verbatim.
 *
 * This runs every shipped example through the same checks as the MCP
 * `validate_snippet` tool + the eslint-plugin: TW4 dead classes and invalid
 * enum prop values (checked against the manifest's own prop data). A shipped
 * example that references a removed variant or a dead class fails the gate.
 *
 *   node scripts/lint-doc-examples.mjs            # report
 *   node scripts/lint-doc-examples.mjs --check    # exit 1 on any issue
 *
 * Dead-class rules MIRROR @devalok/eslint-plugin-shilp-sutra + the MCP
 * validate_snippet tool — keep the three in sync.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(join(ROOT, 'mcp-manifest.json'), 'utf-8'))

const DEAD_CLASS_RULES = [
  { re: /\bshadow-0[1-5]\b/g, msg: 'numeric shadow alias (renamed 0.23.0 → shadow-raised/floating/overlay)' },
  { re: /(?<![\w-])(?:bg|border|text|ring|outline|divide|fill|stroke)-surface-[1-4](?![\w-])/g, msg: 'numeric surface alias (removed 0.23.0 → surface-base/raised/…)' },
  { re: /(?<![\w-])(?:(?:hover|focus|active|disabled|group-hover|dark):)*shadow(?![\w-])/g, msg: 'bare `shadow` renders nothing in TW4 → shadow-raised/floating/overlay' },
  { re: /\bbg-gradient-to-[a-z]{1,2}\b/g, msg: '`bg-gradient-to-*` dead in TW4 → bg-linear-to-*' },
  { re: /(?<![\w-])(?:w|h|min-w|min-h|max-w|max-h|size|p|px|py|pt|pb|pl|pr|m|mx|my|gap|top|left|right|bottom|inset)-\[--[\w-]+\]/g, msg: 'TW3 `-[--x]` syntax dead in TW4 → -(--x)' },
  { re: /@devalok\/shilp-sutra\/tailwind\b/g, msg: '`/tailwind` preset removed 0.38' },
  { re: /theme\(\s*spacing\./g, msg: '`theme(spacing.N)` dead in TW4 → literal value' },
]

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase()

const findings = []
let exampleCount = 0

for (const [name, c] of Object.entries(manifest.components)) {
  for (const ex of c.examples || []) {
    exampleCount++
    // Strip comments so prose like `// on-page tile (no shadow)` doesn't
    // trip the class rules — we only want to lint actual code/classNames.
    const code = ex.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
    // TW4 dead classes
    for (const rule of DEAD_CLASS_RULES) {
      const seen = new Set()
      for (const m of code.matchAll(rule.re)) {
        if (seen.has(m[0])) continue
        seen.add(m[0])
        findings.push({ component: name, kind: 'dead-class', found: m[0].trim(), issue: rule.msg })
      }
    }
    // Invalid enum prop values — checked against the manifest's own props
    for (const tag of code.matchAll(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)\/?>/g)) {
      const comp = manifest.components[kebab(tag[1])]
      if (!comp) continue
      for (const a of tag[2].matchAll(/([a-z][A-Za-z0-9]*)=["']([^"']*)["']/g)) {
        const prop = comp.props?.[a[1]]
        if (prop?.type?.name === 'enum' && Array.isArray(prop.type.value) && !prop.type.value.map(String).includes(a[2])) {
          findings.push({ component: name, kind: 'invalid-enum', found: `<${tag[1]} ${a[1]}="${a[2]}">`, issue: `not a valid ${tag[1]}.${a[1]} (allowed: ${prop.type.value.join(', ')})` })
        }
      }
    }
  }
}

console.log(`lint-doc-examples: scanned ${exampleCount} examples across ${Object.keys(manifest.components).length} components`)
if (findings.length) {
  console.error(`lint-doc-examples: ${findings.length} issue(s) in shipped examples:`)
  for (const f of findings) console.error(`  - [${f.component}] ${f.kind}: ${f.found} — ${f.issue}`)
  console.error('Fix the example(s) in docs/components/*.md, rerun build-mcp-manifest, then rerun.')
  process.exit(1)
}
console.log('lint-doc-examples: OK — no dead classes or invalid enum props in any shipped example')
