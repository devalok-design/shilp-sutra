#!/usr/bin/env node
/**
 * audit-component-docs.mjs
 *
 * Cross-checks per-component Markdown docs under docs/components/*.md against
 * the CVA definitions in their source files. Reports drift:
 *   - Axes present in source but not documented (doc is stale — new variant
 *     not mentioned)
 *   - Axes documented but not in source (doc is stale — variant removed)
 *   - Variant values that changed within an existing axis
 *   - defaultVariants mismatches
 *
 * This is a *mechanical* check. It doesn't catch semantic drift (wrong
 * descriptions, missing composability notes, outdated examples). Those
 * require manual review — see the hybrid audit plan.
 *
 * Usage (from packages/core/):
 *   node scripts/audit-component-docs.mjs         # human-readable report
 *   node scripts/audit-component-docs.mjs --json  # JSON for tooling
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const DOCS = join(ROOT, 'docs', 'components')

const CATEGORIES = ['ui', 'composed', 'shell']
const SKIP_DIRS = new Set(['lib', '__tests__', 'extensions', '_internal'])

// ── Source scan ─────────────────────────────────────────────────────────────

function scanComponents(dir) {
  const names = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      names.push(entry)
      continue
    }
    if (!entry.endsWith('.tsx')) continue
    if (entry.endsWith('.test.tsx') || entry.endsWith('.stories.tsx')) continue
    if (entry === 'index.tsx') continue
    if (entry.endsWith('-types.tsx')) continue
    names.push(basename(entry, '.tsx'))
  }
  return [...new Set(names)].sort()
}

// ── CVA extraction (walks paren/brace pairs manually) ───────────────────────

function extractCvaBlocks(source) {
  const blocks = []
  let i = 0
  while (i < source.length) {
    const idx = source.indexOf('cva(', i)
    if (idx === -1) break
    const before = source[idx - 1] ?? ' '
    if (/[A-Za-z0-9_$]/.test(before)) {
      i = idx + 4
      continue
    }
    const start = idx + 4
    const end = findMatchingParen(source, start)
    if (end === -1) {
      i = idx + 4
      continue
    }
    blocks.push(source.slice(start, end))
    i = end + 1
  }
  return blocks
}

function findMatchingParen(s, start) {
  let depth = 1
  let i = start
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i++
      while (i < s.length) {
        if (s[i] === '\\') { i += 2; continue }
        if (s[i] === q) { i++; break }
        if (q === '`' && s[i] === '$' && s[i + 1] === '{') {
          let bd = 1
          i += 2
          while (i < s.length && bd > 0) {
            if (s[i] === '{') bd++
            else if (s[i] === '}') bd--
            i++
          }
          continue
        }
        i++
      }
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') i++
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      i += 2
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return -1
}

function parseVariantsBlock(cvaBody) {
  const variants = findNamedObject(cvaBody, 'variants')
  const defaults = findNamedObject(cvaBody, 'defaultVariants')
  const axes = {}
  if (variants) {
    for (const axis of extractTopLevelKeys(variants)) {
      const axisBody = findNamedObject(variants, axis)
      if (!axisBody) continue
      axes[axis] = extractTopLevelKeys(axisBody)
    }
  }
  const defaultMap = {}
  if (defaults) {
    for (const m of defaults.matchAll(/([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*['"]([^'"]*)['"]/g)) {
      defaultMap[m[1]] = m[2]
    }
  }
  return { axes, defaults: defaultMap }
}

function extractTopLevelKeys(body) {
  const keys = []
  let i = 0
  let depth = 0
  let expectingKey = true
  while (i < body.length) {
    const c = body[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      if (expectingKey && depth === 0) {
        const end = findQuoteEnd(body, i + 1, q)
        keys.push(body.slice(i + 1, end))
        i = end + 1
        while (i < body.length && /\s/.test(body[i])) i++
        if (body[i] === ':') i++
        i = skipValue(body, i)
        expectingKey = false
        continue
      }
      const end = findQuoteEnd(body, i + 1, q)
      i = end + 1
      continue
    }
    if (c === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++
      continue
    }
    if (c === '/' && body[i + 1] === '*') {
      i += 2
      while (i < body.length && !(body[i] === '*' && body[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '{' || c === '[' || c === '(') depth++
    else if (c === '}' || c === ']' || c === ')') depth--
    else if (c === ',' && depth === 0) expectingKey = true
    else if (expectingKey && depth === 0 && /[A-Za-z_$]/.test(c)) {
      const startIdx = i
      let j = i
      while (j < body.length && /[A-Za-z0-9_$]/.test(body[j])) j++
      keys.push(body.slice(startIdx, j))
      i = j
      while (i < body.length && /\s/.test(body[i])) i++
      if (body[i] === ':') i++
      i = skipValue(body, i)
      expectingKey = false
      continue
    }
    i++
  }
  return keys
}

function findQuoteEnd(s, start, q) {
  let i = start
  while (i < s.length) {
    if (s[i] === '\\') { i += 2; continue }
    if (s[i] === q) return i
    i++
  }
  return s.length
}

function skipValue(body, start) {
  let i = start
  while (i < body.length && /\s/.test(body[i])) i++
  let depth = 0
  while (i < body.length) {
    const c = body[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i = findQuoteEnd(body, i + 1, q) + 1
      continue
    }
    if (c === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++
      continue
    }
    if (c === '/' && body[i + 1] === '*') {
      i += 2
      while (i < body.length && !(body[i] === '*' && body[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '{' || c === '[' || c === '(') depth++
    else if (c === '}' || c === ']' || c === ')') {
      if (depth === 0) return i
      depth--
    }
    else if (c === ',' && depth === 0) return i
    i++
  }
  return i
}

function findNamedObject(body, name) {
  const pattern = new RegExp(`\\b${name}\\s*:\\s*\\{`, 'g')
  const m = [...body.matchAll(pattern)][0]
  if (!m) return null
  const openIdx = m.index + m[0].length - 1
  const close = findMatchingBrace(body, openIdx + 1)
  if (close === -1) return null
  return body.slice(openIdx + 1, close)
}

function findMatchingBrace(s, start) {
  let depth = 1
  let i = start
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i = findQuoteEnd(s, i + 1, q) + 1
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') i++
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      i += 2
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return -1
}

// ── Doc parsing ─────────────────────────────────────────────────────────────

function extractDocAxes(doc) {
  const axes = {}
  const propsMatch = doc.match(/##\s*Props\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (!propsMatch) return axes
  const propsSection = propsMatch[1]
  for (const m of propsSection.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*((?:"[^"]*"\s*\|\s*)+"[^"]*")/gm)) {
    const axis = m[1]
    const values = [...m[2].matchAll(/"([^"]*)"/g)].map((mm) => mm[1])
    if (values.length >= 2) axes[axis] = values
  }
  return axes
}

function extractDocDefaults(doc) {
  const out = {}
  const m = doc.match(/##\s*Defaults?\s*\n([\s\S]*?)(?=\n##\s|$)/)
  if (!m) return out
  for (const mm of m[1].matchAll(/([A-Za-z][A-Za-z0-9]*)\s*(?:=|:)\s*["']([^"']+)["']/g)) {
    out[mm[1]] = mm[2]
  }
  return out
}

// ── Diff ────────────────────────────────────────────────────────────────────

function diffAxes(sourceAxes, docAxes) {
  const issues = []
  const sourceKeys = new Set(Object.keys(sourceAxes))
  const docKeys = new Set(Object.keys(docAxes))

  for (const axis of sourceKeys) {
    if (!docKeys.has(axis)) {
      issues.push({
        severity: 'high',
        kind: 'missing-axis',
        axis,
        detail: `Source has axis "${axis}" with values [${sourceAxes[axis].join(', ')}]; doc Props section does not mention it.`,
      })
    }
  }
  for (const axis of docKeys) {
    if (!sourceKeys.has(axis)) {
      issues.push({
        severity: 'medium',
        kind: 'extra-axis',
        axis,
        detail: `Doc lists axis "${axis}" but source has no CVA variant with that name (may be a TS-only prop — verify manually).`,
      })
    }
  }
  for (const axis of sourceKeys) {
    if (!docKeys.has(axis)) continue
    const src = new Set(sourceAxes[axis])
    const docSet = new Set(docAxes[axis])
    const missingFromDoc = [...src].filter((v) => !docSet.has(v))
    const missingFromSrc = [...docSet].filter((v) => !src.has(v))
    if (missingFromDoc.length > 0) {
      issues.push({
        severity: 'high',
        kind: 'missing-values',
        axis,
        detail: `Source "${axis}" = ${JSON.stringify([...src])}; doc missing: ${JSON.stringify(missingFromDoc)}.`,
      })
    }
    if (missingFromSrc.length > 0) {
      issues.push({
        severity: 'medium',
        kind: 'extra-values',
        axis,
        detail: `Doc "${axis}" = ${JSON.stringify([...docSet])}; source no longer has: ${JSON.stringify(missingFromSrc)}.`,
      })
    }
  }
  return issues
}

function diffDefaults(sourceDefaults, docDefaults) {
  const issues = []
  for (const [axis, val] of Object.entries(sourceDefaults)) {
    if (!(axis in docDefaults)) {
      issues.push({
        severity: 'low',
        kind: 'missing-default',
        axis,
        detail: `Source defaultVariants has ${axis}="${val}"; doc Defaults section does not mention it.`,
      })
    } else if (docDefaults[axis] !== val) {
      issues.push({
        severity: 'high',
        kind: 'default-mismatch',
        axis,
        detail: `Source default ${axis}="${val}" but doc says ${axis}="${docDefaults[axis]}".`,
      })
    }
  }
  return issues
}

// ── Per-component audit ─────────────────────────────────────────────────────

function auditComponent(category, name) {
  const candidates = []
  const topLevel = join(SRC, category, `${name}.tsx`)
  const dir = join(SRC, category, name)
  try {
    statSync(topLevel)
    candidates.push(topLevel)
  } catch { /* no top-level */ }
  try {
    const s = statSync(dir)
    if (s.isDirectory()) {
      for (const entry of readdirSync(dir)) {
        if (!entry.endsWith('.tsx')) continue
        if (entry.endsWith('.test.tsx') || entry.endsWith('.stories.tsx')) continue
        candidates.push(join(dir, entry))
      }
    }
  } catch { /* no dir */ }

  if (candidates.length === 0) {
    return { name, category, issues: [{ severity: 'low', kind: 'no-source', detail: 'No .tsx source found.' }] }
  }

  const sourceAxes = {}
  const sourceDefaults = {}
  for (const file of candidates) {
    const src = readFileSync(file, 'utf8')
    for (const body of extractCvaBlocks(src)) {
      const { axes, defaults } = parseVariantsBlock(body)
      for (const [axis, values] of Object.entries(axes)) {
        if (!sourceAxes[axis]) sourceAxes[axis] = new Set()
        for (const v of values) sourceAxes[axis].add(v)
      }
      for (const [k, v] of Object.entries(defaults)) {
        sourceDefaults[k] = v
      }
    }
  }
  const sourceAxesArr = {}
  for (const [k, v] of Object.entries(sourceAxes)) sourceAxesArr[k] = [...v]

  const docPath = join(DOCS, category, `${name}.md`)
  let doc
  try {
    doc = readFileSync(docPath, 'utf8')
  } catch {
    return { name, category, issues: [{ severity: 'high', kind: 'no-doc', detail: `Missing doc at ${docPath}` }] }
  }

  const docAxes = extractDocAxes(doc)
  const docDefaults = extractDocDefaults(doc)

  const issues = [
    ...diffAxes(sourceAxesArr, docAxes),
    ...diffDefaults(sourceDefaults, docDefaults),
  ]

  return { name, category, issues, sourceAxes: sourceAxesArr, docAxes, sourceDefaults, docDefaults }
}

// ── Run ─────────────────────────────────────────────────────────────────────

const jsonMode = process.argv.includes('--json')
const results = []
const summary = { clean: 0, withIssues: 0, totalIssues: 0, bySeverity: { high: 0, medium: 0, low: 0 } }

for (const cat of CATEGORIES) {
  const names = scanComponents(join(SRC, cat))
  for (const name of names) {
    const r = auditComponent(cat, name)
    results.push(r)
    if (r.issues.length === 0) summary.clean++
    else {
      summary.withIssues++
      summary.totalIssues += r.issues.length
      for (const i of r.issues) summary.bySeverity[i.severity] = (summary.bySeverity[i.severity] ?? 0) + 1
    }
  }
}

if (jsonMode) {
  console.log(JSON.stringify({ summary, results }, null, 2))
} else {
  const nIssues = results.filter((r) => r.issues.length > 0)
  if (nIssues.length === 0) {
    console.log('All component docs match their CVA source.')
  } else {
    console.log(`\n${summary.withIssues} component(s) have drift (${summary.totalIssues} issue(s) total):`)
    console.log(`  high=${summary.bySeverity.high ?? 0}  medium=${summary.bySeverity.medium ?? 0}  low=${summary.bySeverity.low ?? 0}\n`)

    const order = { high: 0, medium: 1, low: 2 }
    for (const r of nIssues) {
      r.issues.sort((a, b) => order[a.severity] - order[b.severity])
    }
    nIssues.sort((a, b) => {
      const aMax = Math.min(...a.issues.map((i) => order[i.severity]))
      const bMax = Math.min(...b.issues.map((i) => order[i.severity]))
      return aMax - bMax
    })

    for (const r of nIssues) {
      console.log(`──  ${r.category}/${r.name}  ──`)
      for (const issue of r.issues) {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.kind}: ${issue.detail}`)
      }
      console.log('')
    }
  }
  console.log(`Clean: ${summary.clean} components.\n`)
}

process.exit(0)
