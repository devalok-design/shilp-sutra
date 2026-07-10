#!/usr/bin/env node
/**
 * check-tool-list.mjs
 *
 * Freshness gate for the hand-written MCP tool lists. The authoritative set of
 * tools is the `server.tool('<name>', …)` registrations in the MCP server; docs
 * that enumerate the tools (mcp-server README, AGENTS.md) re-state that set by
 * hand and silently rot when a tool is added (this is exactly how "6 tools"
 * survived four new tools shipping in 0.47).
 *
 * This asserts every REGISTERED tool name appears in each doc that enumerates
 * the surface. It does NOT flag doc-mentioned-but-unregistered names (prose
 * legitimately references removed tools in historical/migration context) —
 * the failure mode we're guarding is docs OMITTING a live tool.
 *
 *   node scripts/check-tool-list.mjs            # report
 *   node scripts/check-tool-list.mjs --check    # exit 1 if any doc omits a tool
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SERVER = join(ROOT, 'packages/mcp-server/src/index.mjs')
// Docs that enumerate the tool surface and must list every registered tool.
const DOCS = ['packages/mcp-server/README.md', 'AGENTS.md']

const serverSrc = readFileSync(SERVER, 'utf-8')
const registered = [...serverSrc.matchAll(/server\.tool\(\s*['"]([a-z_]+)['"]/g)].map((m) => m[1])
const tools = [...new Set(registered)].sort()

if (tools.length === 0) {
  console.error('check-tool-list: found 0 registered tools — did index.mjs move or change the registration shape?')
  process.exit(1)
}

const problems = []
for (const rel of DOCS) {
  let doc
  try {
    doc = readFileSync(join(ROOT, rel), 'utf-8')
  } catch {
    problems.push(`${rel}: not found`)
    continue
  }
  const missing = tools.filter((t) => !doc.includes(t))
  if (missing.length) problems.push(`${rel}: missing ${missing.join(', ')}`)
}

console.log(`check-tool-list: ${tools.length} registered tools — ${tools.join(', ')}`)
if (problems.length) {
  console.error('check-tool-list: FAIL — docs out of sync with registered tools:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error('Fix: list every tool in the doc(s) above, then rerun.')
  process.exit(1)
}
console.log(`check-tool-list: OK — all ${tools.length} tools documented in ${DOCS.join(', ')}`)
