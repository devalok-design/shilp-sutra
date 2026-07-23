#!/usr/bin/env node
/**
 * check-slop.mjs
 *
 * DS-native anti-slop checker. Runs the signature corpus (scripts/slop-corpus.json)
 * over component source and reports slop tells the generic markup scanners miss
 * (they're blind to Tailwind-utility + DS-token semantics). The corpus grows
 * from real audit findings, so it never goes stale.
 *
 * Rule kinds:
 *   - line          : regex matched per line → one finding per matching line
 *   - count-per-file: >= `threshold` matching lines in one file → one finding
 *
 * Suppress: put `// slop-allow: <id> <reason>` on the offending line (line rules)
 * or anywhere in the file (count rules). Reason is required (audit trail).
 *
 * Usage (from packages/core/):
 *   node scripts/check-slop.mjs           # human report
 *   node scripts/check-slop.mjs --json    # machine backlog (JSON to stdout)
 *   node scripts/check-slop.mjs --check   # CI gate: exit 1 on any P0/P1 finding
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const SRC = join(ROOT, 'src')
const SCAN_DIRS = ['ui', 'composed', 'shell', 'ai']

const args = process.argv.slice(2)
const AS_JSON = args.includes('--json')
const AS_CHECK = args.includes('--check')

const corpus = JSON.parse(readFileSync(join(HERE, 'slop-corpus.json'), 'utf8'))
const RULES = corpus.rules.map((r) => ({ ...r, re: new RegExp(r.pattern, 'g') }))
const SEV_ORDER = { P0: 0, P1: 1, P2: 2 }

function allowedOnLine(line, id) {
  const m = line.match(/\/\/\s*slop-allow:\s*([\w-]+)/)
  return m && m[1] === id
}
function allowedInFile(src, id) {
  const re = new RegExp(`//\\s*slop-allow:\\s*${id}\\b`)
  return re.test(src)
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
for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')

  for (const rule of RULES) {
    if (rule.kind === 'count-per-file') {
      if (allowedInFile(src, rule.id)) continue
      let hits = 0
      let firstLine = 0
      lines.forEach((line, i) => {
        rule.re.lastIndex = 0
        if (rule.re.test(line)) { hits += 1; if (!firstLine) firstLine = i + 1 }
      })
      if (hits >= (rule.threshold ?? 2)) {
        findings.push({ file: rel, line: firstLine, rule: rule.id, severity: rule.severity, count: hits, message: rule.message, setu: rule.setu })
      }
    } else {
      lines.forEach((line, i) => {
        rule.re.lastIndex = 0
        const prev = i > 0 ? lines[i - 1] : ''
        // Suppress via `// slop-allow: <id>` on the line itself or the line above.
        if (rule.re.test(line) && !allowedOnLine(line, rule.id) && !allowedOnLine(prev, rule.id)) {
          findings.push({ file: rel, line: i + 1, rule: rule.id, severity: rule.severity, message: rule.message, setu: rule.setu })
        }
      })
    }
  }
}

findings.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || a.file.localeCompare(b.file) || a.line - b.line)

if (AS_JSON) {
  process.stdout.write(JSON.stringify({ scanned: files.length, findings }, null, 2) + '\n')
  process.exit(0)
}

// Human report
const bySev = { P0: [], P1: [], P2: [] }
for (const f of findings) bySev[f.severity].push(f)
const counts = corpus.rules.reduce((m, r) => ((m[r.id] = 0), m), {})
for (const f of findings) counts[f.rule] += 1

console.log(`\n  Anti-slop check — ${files.length} components scanned\n`)
if (findings.length === 0) {
  console.log('  ✓ No slop signatures found.\n')
} else {
  for (const sev of ['P0', 'P1', 'P2']) {
    const list = bySev[sev]
    if (!list.length) continue
    console.log(`  ── ${sev} (${list.length}) ──`)
    for (const f of list) {
      const c = f.count ? ` ×${f.count}` : ''
      console.log(`  ${f.file}:${f.line}  [${f.rule}${c}]  ${f.setu}`)
    }
    console.log('')
  }
  console.log('  By rule: ' + Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${k}=${n}`).join('  '))
  console.log(`  Total: ${findings.length} findings across ${new Set(findings.map((f) => f.file)).size} files\n`)
}

if (AS_CHECK) {
  const blocking = findings.filter((f) => f.severity === 'P0' || f.severity === 'P1')
  if (blocking.length) {
    console.error(`  ✗ ${blocking.length} P0/P1 slop findings — fix or annotate with \`// slop-allow: <id> <reason>\`.\n`)
    process.exit(1)
  }
}
