#!/usr/bin/env node
/**
 * Emit `docs/rules/<name>.md` for every rule, from the rule's own metadata.
 *
 * Every rule's `createRule()` call advertises a docs URL of the form
 *   .../packages/eslint-plugin/docs/rules/<name>.md
 * and that directory had never been created, so all 16 links 404'd.
 *
 * Content is derived from `meta` rather than hand-written, so a rule's
 * description, preset membership, severity, fixability and message text cannot
 * drift from the docs page describing them. Prose that metadata cannot express
 * — the "why" behind a rule — lives in the rule file's own leading block
 * comment and is lifted verbatim.
 *
 * Wired into `pnpm docs:rules`, and the pre-publish audit fails if a rule has
 * no page. Unlike generate-configs.mjs this one is safe to run: it writes only
 * into docs/rules/, which nothing hand-maintains.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')
const RULES_DIR = join(PKG, 'src/rules')
const OUT_DIR = join(PKG, 'docs/rules')

const check = process.argv.includes('--check')

/** Pull a field out of the `meta` object literal without executing TypeScript. */
function field(src, key) {
  const m = src.match(new RegExp(`\\b${key}:\\s*(?:'([^']*)'|"([^"]*)"|\`([^\`]*)\`)`))
  return m ? (m[1] ?? m[2] ?? m[3]) : null
}

/** Multi-line description written as an adjacent string continuation. */
function description(src) {
  const m = src.match(/description:\s*((?:\s*(?:'[^']*'|"[^"]*"|`[^`]*`)\s*\+?)+)/)
  if (!m) return null
  return [...m[1].matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)]
    .map((x) => x[1] ?? x[2] ?? x[3])
    .join('')
    .trim()
}

/**
 * The rationale block comment. Take the LAST `/** … *\/` that appears before
 * `createRule(` — matching on what immediately follows the comment misses the
 * rules that declare helpers or types between the comment and the rule.
 */
function rationale(src) {
  const upto = src.slice(0, src.indexOf('createRule<') + 1 || src.indexOf('createRule('))
  const blocks = [...upto.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
  if (!blocks.length) return null
  const m = blocks[blocks.length - 1]
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*ic?\s?/, '').replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim()
}

function messages(src) {
  const block = src.match(/messages:\s*\{([\s\S]*?)\n {4}\}/)
  if (!block) return []
  return [...block[1].matchAll(/(\w+):\s*((?:\s*(?:'[^']*'|"[^"]*"|`[^`]*`)\s*\+?)+)/g)].map((m) => [
    m[1],
    [...m[2].matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)]
      .map((x) => x[1] ?? x[2] ?? x[3])
      .join(''),
  ])
}

const files = readdirSync(RULES_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && !f.includes('.test.'))

mkdirSync(OUT_DIR, { recursive: true })
const written = []
const stale = []

for (const file of files) {
  const name = file.replace(/\.ts$/, '')
  // Normalise on read. The rationale is lifted verbatim out of the rule source,
  // and these files are CRLF in a Windows working tree — without this the same
  // rule generates byte-different pages on Windows and Linux, so the --check
  // gate fails in CI against a page committed from Windows, or the reverse.
  const src = readFileSync(join(RULES_DIR, file), 'utf8').replace(/\r\n/g, '\n')

  const desc = description(src) ?? '_No description in rule metadata._'
  const category = field(src, 'category')
  const recommended = field(src, 'recommended')
  const appliesFrom = field(src, 'appliesFrom')
  const type = field(src, 'type')
  const fixable = field(src, 'fixable')
  const why = rationale(src)
  const msgs = messages(src)

  const presets = []
  if (category === 'migration') presets.push('`migration`', '`recommended` (error)', '`strict` (error)')
  else if (recommended === 'error') presets.push('`recommended` (error)', '`strict` (error)')
  else if (recommended === 'warn') presets.push('`recommended` (warn)', '`strict` (error)')
  else presets.push('`strict`')

  const lines = [
    `# \`${name}\``,
    '',
    desc,
    '',
    '| | |',
    '|---|---|',
    `| Type | \`${type ?? 'problem'}\` |`,
    `| Category | \`${category ?? '—'}\` |`,
    `| Presets | ${presets.join(', ')} |`,
    `| Fixable | ${fixable ? `yes (\`${fixable}\`)` : 'no'} |`,
    appliesFrom ? `| Applies from | \`${appliesFrom}\` |` : null,
    '',
  ].filter((l) => l !== null)

  if (why) lines.push('## Why', '', why, '')

  if (msgs.length) {
    lines.push('## What it reports', '')
    for (const [id, text] of msgs) lines.push(`**\`${id}\`**`, '', `> ${text}`, '')
  }

  lines.push(
    '## Configuration',
    '',
    '```js',
    "// eslint.config.js — flat config",
    "import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'",
    '',
    'export default [',
    '  shilpSutra.configs[\'flat-recommended\'],',
    ']',
    '```',
    '',
    'Or enable just this rule:',
    '',
    '```js',
    '{',
    "  plugins: { 'shilp-sutra': shilpSutra },",
    `  rules: { 'shilp-sutra/${name}': 'error' },`,
    '}',
    '```',
    '',
    '---',
    '',
    `<sub>Generated from \`src/rules/${file}\` by \`scripts/generate-rule-docs.mjs\`. Edit the rule's metadata, not this file.</sub>`,
    '',
  )

  const content = lines.join('\n')
  const out = join(OUT_DIR, `${name}.md`)

  if (check) {
    let existing = null
    try { existing = readFileSync(out, 'utf8') } catch { /* missing */ }
    // Compare line-ending-insensitively. Git normalises to CRLF in the working
    // tree on Windows while this script writes LF, so an exact comparison
    // reports every page stale after a fresh checkout — a false failure that
    // would send someone regenerating files that are already correct.
    const norm = (t) => (t == null ? null : t.replace(/\r\n/g, '\n'))
    if (norm(existing) !== norm(content)) stale.push(name)
    continue
  }

  writeFileSync(out, content)
  written.push(name)
}

if (check) {
  if (stale.length) {
    console.error(`✗ ${stale.length} rule doc(s) missing or out of date: ${stale.join(', ')}`)
    console.error('  Run: pnpm --filter @devalok/eslint-plugin-shilp-sutra docs:rules')
    process.exit(1)
  }
  console.log(`✓ ${files.length} rule docs in sync`)
} else {
  console.log(`✓ wrote ${written.length} rule docs to docs/rules/`)
}
