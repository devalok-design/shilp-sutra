#!/usr/bin/env node
/**
 * figma-sync-components.mjs
 *
 * Parses a CVA component source file and emits a JSON spec that describes
 * every variant × color × size × state combination, mapped to the DS tokens
 * each compound variant binds. This JSON is the authoritative input to the
 * Figma component-generation step.
 *
 * Usage:
 *   node packages/core/scripts/figma-sync-components.mjs button
 *   node packages/core/scripts/figma-sync-components.mjs badge
 *
 * Output:
 *   packages/core/scripts/.figma/components/<name>.json
 *
 * The parser is intentionally lightweight — it handles the CVA call shape the
 * DS uses (variants, compoundVariants, defaultVariants). If you change that
 * shape, update the parser.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const UI_DIR = join(HERE, '..', 'src', 'ui')
const OUT_DIR = join(HERE, '.figma', 'components')

const componentName = process.argv[2]
if (!componentName) {
  console.error('Usage: figma-sync-components.mjs <component-name>')
  console.error('Example: figma-sync-components.mjs button')
  process.exit(1)
}

const sourcePath = resolve(UI_DIR, `${componentName}.tsx`)
const source = readFileSync(sourcePath, 'utf8')

/** Slice out the CVA call body — assumes one cva(...) per file. */
function extractCva(src) {
  const cvaIdx = src.search(/cva\s*\(/)
  if (cvaIdx === -1) throw new Error(`No cva() call found in ${sourcePath}`)
  const start = src.indexOf('(', cvaIdx)
  let depth = 1, i = start + 1
  while (i < src.length && depth > 0) {
    const ch = src[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (depth === 0) break
    i++
  }
  return src.slice(start + 1, i)
}

/** Read the string literal starting at idx (handles ', ", `). */
function readStringAt(src, idx) {
  while (idx < src.length && /\s/.test(src[idx])) idx++
  const q = src[idx]
  if (q !== "'" && q !== '"' && q !== '`') return null
  let out = '', i = idx + 1
  while (i < src.length) {
    if (src[i] === '\\') { out += src[i + 1]; i += 2; continue }
    if (src[i] === q) break
    out += src[i]
    i++
  }
  return { value: out, end: i + 1 }
}

/** Read the balanced object literal body at src[startIdx]. */
function readObjectAt(src, startIdx) {
  while (startIdx < src.length && /\s/.test(src[startIdx])) startIdx++
  if (src[startIdx] !== '{') return null
  let depth = 1, i = startIdx + 1
  while (i < src.length && depth > 0) {
    const ch = src[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    if (depth === 0) break
    i++
  }
  return { body: src.slice(startIdx + 1, i), end: i + 1 }
}

function parseVariants(src, key) {
  const idx = src.search(new RegExp(`\\b${key}\\s*:\\s*{`))
  if (idx === -1) return null
  const brace = src.indexOf('{', idx)
  const obj = readObjectAt(src, brace)
  if (!obj) return null
  const axes = {}
  // Iterate axisName { ... } entries via matchAll
  for (const m of obj.body.matchAll(/(\w+)\s*:\s*{/g)) {
    const axisName = m[1]
    const axisObj = readObjectAt(obj.body, m.index + m[0].length - 1)
    if (!axisObj) continue
    const entries = {}
    for (const em of axisObj.body.matchAll(/(\w+|'[\w-]+'|"[\w-]+")\s*:\s*/g)) {
      const rawKey = em[1].replace(/^['"]|['"]$/g, '')
      const strAt = readStringAt(axisObj.body, em.index + em[0].length)
      if (strAt) entries[rawKey] = strAt.value
    }
    axes[axisName] = entries
  }
  return axes
}

function parseCompoundVariants(src) {
  const idx = src.search(/\bcompoundVariants\s*:\s*\[/)
  if (idx === -1) return []
  const start = src.indexOf('[', idx)
  let depth = 1, i = start + 1
  while (i < src.length && depth > 0) {
    const ch = src[i]
    if (ch === '[') depth++
    else if (ch === ']') depth--
    if (depth === 0) break
    i++
  }
  const body = src.slice(start + 1, i)
  const entries = []
  let d = 0, s = -1
  for (let k = 0; k < body.length; k++) {
    if (body[k] === '{') { if (d === 0) s = k; d++ }
    else if (body[k] === '}') { d--; if (d === 0 && s !== -1) { entries.push(body.slice(s + 1, k)); s = -1 } }
  }
  return entries.map(e => {
    const obj = {}
    for (const m of e.matchAll(/(\w+)\s*:\s*/g)) {
      const key = m[1]
      const afterIdx = m.index + m[0].length
      const strAt = readStringAt(e, afterIdx)
      if (strAt) obj[key] = strAt.value
    }
    return obj
  })
}

function parseDefaultVariants(src) {
  const idx = src.search(/\bdefaultVariants\s*:\s*{/)
  if (idx === -1) return {}
  const brace = src.indexOf('{', idx)
  const obj = readObjectAt(src, brace)
  if (!obj) return {}
  const entries = {}
  for (const m of obj.body.matchAll(/(\w+)\s*:\s*['"]([\w-]+)['"]/g)) {
    entries[m[1]] = m[2]
  }
  return entries
}

const EMPTY_TOKENS = () => ({
  bg: [], text: [], border: [], padding: [], radius: [], gap: [], height: [], shadow: [], opacity: [],
})

/** Classify one unprefixed Tailwind class into a token bucket. */
function classify(c, into) {
  let m
  if ((m = c.match(/^bg-([a-z0-9-]+)$/)))               into.bg.push(m[1])
  else if ((m = c.match(/^text-([a-z0-9-]+)$/)))        into.text.push(m[1])
  else if ((m = c.match(/^border-([a-z0-9-]+)$/)))      into.border.push(m[1])
  else if ((m = c.match(/^p[xy]?-ds-([a-z0-9]+)$/)))    into.padding.push(m[1])
  // Radius is ROLE-based in this system (rounded-control, rounded-pill,
  // rounded-surface). Matching only `rounded-ds-*` missed every component's
  // radius silently, because Button uses rounded-control. Both forms now match.
  else if ((m = c.match(/^rounded-ds-([a-z0-9]+)$/)))   into.radius.push('ds-' + m[1])
  else if ((m = c.match(/^rounded-([a-z][a-z0-9-]*)$/))) into.radius.push(m[1])
  else if ((m = c.match(/^gap-ds-([a-z0-9]+)$/)))       into.gap.push(m[1])
  else if ((m = c.match(/^h-ds-([a-z0-9-]+)$/)))        into.height.push(m[1])
  else if ((m = c.match(/^w-ds-([a-z0-9-]+)$/)))        into.height.push(m[1])
  else if ((m = c.match(/^shadow-([a-z-]+)$/)))         into.shadow.push(m[1])
  else if ((m = c.match(/^opacity-([a-z0-9-]+)$/)))     into.opacity.push(m[1])
}

/**
 * Extract DS token references from a Tailwind className string, split by state.
 *
 * Interactive state lives in pseudo-class PREFIXES (`hover:bg-accent-10`), not
 * in the CVA axes. Ignoring them, as this did previously, meant the emitted spec
 * described only the resting appearance. A Figma State variant built from it
 * would have had no hover or pressed colours to bind to, and the omission is
 * invisible unless you diff against the source.
 *
 * Returns the resting tokens under `tokens` (unchanged shape, so existing
 * consumers keep working) and adds `states` alongside.
 */
function extractTokenRefs(classes) {
  if (!classes) return {}
  const base = EMPTY_TOKENS()
  const states = { hover: EMPTY_TOKENS(), active: EMPTY_TOKENS(), disabled: EMPTY_TOKENS(), focus: EMPTY_TOKENS() }

  for (const raw of classes.split(/\s+/)) {
    if (!raw) continue
    const m = raw.match(/^(hover|active|disabled|focus-visible|focus):(.+)$/)
    if (m) {
      const key = m[1] === 'focus-visible' ? 'focus' : m[1]
      classify(m[2], states[key])
    } else {
      classify(raw, base)
    }
  }

  // Drop states that contributed nothing, so the output shows at a glance which
  // states a variant actually defines.
  const used = {}
  for (const [k, v] of Object.entries(states)) {
    if (Object.values(v).some((arr) => arr.length)) used[k] = v
  }

  return Object.assign(base, Object.keys(used).length ? { states: used } : {})
}

function main() {
  const cvaBody = extractCva(source)
  const variants = parseVariants(cvaBody, 'variants') ?? {}
  const compoundVariants = parseCompoundVariants(cvaBody)
  const defaults = parseDefaultVariants(cvaBody)

  const resolvedCompounds = compoundVariants.map(cv => {
    const { className, ...matchAxes } = cv
    return { match: matchAxes, tokens: extractTokenRefs(className), className }
  })

  const resolvedAxes = {}
  for (const [axis, entries] of Object.entries(variants)) {
    resolvedAxes[axis] = {}
    for (const [key, classes] of Object.entries(entries)) {
      resolvedAxes[axis][key] = { tokens: extractTokenRefs(classes), className: classes }
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: `packages/core/src/ui/${componentName}.tsx`,
    component: componentName,
    axes: Object.keys(variants),
    axesResolved: resolvedAxes,
    compoundVariants: resolvedCompounds,
    defaults,
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const outPath = join(OUT_DIR, `${componentName}.json`)
  writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`  axes:             ${Object.keys(variants).join(', ')}`)
  console.log(`  compound rules:   ${compoundVariants.length}`)
  console.log(`  defaults:         ${JSON.stringify(defaults)}`)
  console.log(`\nNext: agent with use_figma MCP access builds the Figma component set from this spec,`)
  console.log(`      binding every token reference to the corresponding Figma Variable.`)
}

main()
