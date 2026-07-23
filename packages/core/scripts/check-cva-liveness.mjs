#!/usr/bin/env node
/**
 * check-cva-liveness.mjs
 *
 * Dead variant surface = slop. Every axis a component's cva() declares should be
 * exercised in its stories (ideally rendered distinctly for Chromatic). This
 * flags declared variant *values* that never appear in the component's
 * .stories.tsx — untested/undemoed surface that's either dead or unproven.
 *
 * Heuristic (static, best-effort): parse the first cva() variants block, list
 * each axis's value keys, and check whether each value is referenced anywhere in
 * the sibling stories file. Not a Chromatic pixel-diff — a coverage smoke signal.
 *
 * Usage (from packages/core/):
 *   node scripts/check-cva-liveness.mjs           # report
 *   node scripts/check-cva-liveness.mjs --json
 *   node scripts/check-cva-liveness.mjs --check   # exit 1 if any axis value is unexercised
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const SCAN_DIRS = ['ui', 'composed', 'shell', 'ai']
const AS_JSON = process.argv.includes('--json')
const AS_CHECK = process.argv.includes('--check')

function sliceBalanced(src, openIdx) {
  // openIdx points at the '{'. Return content between it and its match.
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(openIdx + 1, i) }
  }
  return ''
}

/** Extract { axis: [values...] } from the first cva() variants block. Best-effort. */
function parseCvaAxes(src) {
  const cvaIdx = src.indexOf('cva(')
  if (cvaIdx < 0) return null
  const vIdx = src.indexOf('variants:', cvaIdx)
  if (vIdx < 0) return null
  const brace = src.indexOf('{', vIdx)
  if (brace < 0) return null
  const block = sliceBalanced(src, brace)
  if (!block) return null

  const axes = {}
  // Top-level axis keys: `name: {` at the start of the variants object.
  const axisRe = /(?:^|\n)\s*([A-Za-z][\w]*)\s*:\s*\{/g
  for (const m of block.matchAll(axisRe)) {
    const axis = m[1]
    const axisOpen = block.indexOf('{', m.index + m[0].length - 1)
    const axisBlock = sliceBalanced(block, axisOpen)
    if (!axisBlock) continue
    // Value keys inside an axis: `key:` / `'key':` / `"key":` / `true:`/`false:`
    const values = []
    const valRe = /(?:^|\n|,)\s*(?:'([\w-]+)'|"([\w-]+)"|([A-Za-z][\w]*)|(true|false))\s*:/g
    for (const vm of axisBlock.matchAll(valRe)) {
      const v = vm[1] ?? vm[2] ?? vm[4] ?? vm[3]
      if (v && v !== 'className') values.push(v)
    }
    if (values.length) axes[axis] = [...new Set(values)]
  }
  return Object.keys(axes).length ? axes : null
}

function scan(dir, files) {
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const p = join(dir, e)
    const s = statSync(p)
    if (s.isDirectory()) { scan(p, files); continue }
    if (!p.endsWith('.tsx')) continue
    if (/\.(test|stories)\.tsx$/.test(p)) continue
    files.push(p)
  }
}

const files = []
for (const d of SCAN_DIRS) scan(join(SRC, d), files)

const findings = []
let parsed = 0
for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const src = readFileSync(file, 'utf8')
  const axes = parseCvaAxes(src)
  if (!axes) continue
  parsed++
  const storiesPath = file.replace(/\.tsx$/, '.stories.tsx')
  if (!existsSync(storiesPath)) {
    findings.push({ file: rel, axis: '*', missing: ['(no stories file)'] })
    continue
  }
  const stories = readFileSync(storiesPath, 'utf8')
  for (const [axis, values] of Object.entries(axes)) {
    const missing = values.filter((v) => {
      if (v === 'true' || v === 'false') return false
      const re = new RegExp(`['"\`]?${v}['"\`]?`)
      return !re.test(stories)
    })
    if (missing.length) findings.push({ file: rel, axis, missing })
  }
}

if (AS_JSON) {
  process.stdout.write(JSON.stringify({ scanned: files.length, cvaParsed: parsed, findings }, null, 2) + '\n')
  process.exit(0)
}

console.log(`\n  CVA axis-liveness — ${files.length} components scanned, ${parsed} with a cva()\n`)
if (!findings.length) {
  console.log('  ✓ Every declared variant value is referenced in its stories.\n')
} else {
  for (const f of findings) {
    console.log(`  ${f.file}  [${f.axis}]  unexercised: ${f.missing.join(', ')}`)
  }
  console.log(`\n  ${findings.length} axes with unexercised values across ${new Set(findings.map((f) => f.file)).size} components.`)
  console.log('  (Heuristic — a value may be exercised indirectly. Confirm before deleting an axis.)\n')
}

if (AS_CHECK && findings.length) process.exit(1)
