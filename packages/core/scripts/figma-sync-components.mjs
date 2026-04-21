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

/** Extract DS token references from a Tailwind className string. */
function extractTokenRefs(classes) {
  if (!classes) return {}
  const tokens = {
    bg: [], text: [], border: [], padding: [], radius: [], gap: [], height: [], shadow: [],
  }
  const tw = classes.split(/\s+/)
  for (const c of tw) {
    let m
    if ((m = c.match(/^bg-([a-z0-9-]+)$/)))          tokens.bg.push(m[1])
    else if ((m = c.match(/^text-([a-z0-9-]+)$/)))   tokens.text.push(m[1])
    else if ((m = c.match(/^border-([a-z0-9-]+)$/))) tokens.border.push(m[1])
    else if ((m = c.match(/^p[xy]?-ds-([a-z0-9]+)$/))) tokens.padding.push(m[1])
    else if ((m = c.match(/^rounded-ds-([a-z0-9]+)$/))) tokens.radius.push(m[1])
    else if ((m = c.match(/^gap-ds-([a-z0-9]+)$/)))     tokens.gap.push(m[1])
    else if ((m = c.match(/^h-ds-([a-z0-9-]+)$/)))      tokens.height.push(m[1])
    else if ((m = c.match(/^shadow-([a-z-]+)$/)))       tokens.shadow.push(m[1])
  }
  return tokens
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
