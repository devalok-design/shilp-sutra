/**
 * build-mcp-manifest.mjs
 *
 * Emits mcp-manifest.json — the structured, machine-readable component/token
 * reference the hosted docs MCP server serves (it never parses markdown).
 *
 * Sources:
 *   docs/components/{ui,composed,shell}/{name}.md  (authoring grammar: docs/specs/mcp-manifest-standard.md §2)
 *   src/tokens/semantic.css + typography-semantic.css (token reference)
 *   package.json (packageVersion)
 *
 * Output: mcp-manifest.json at the package root (ships in the tarball).
 *
 * Usage (from packages/core/):
 *   node scripts/build-mcp-manifest.mjs           # generate
 *   node scripts/build-mcp-manifest.mjs --check   # generate to memory + validate only
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { derivePeerMap } from './derive-peer-map.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

const MANIFEST_VERSION = '1.1.0'
const CATEGORIES = ['ui', 'composed', 'shell']
const SKIP_DIRS = new Set(['lib', '__tests__', 'extensions', '_internal'])

// ── Optional peer dependencies ──────────────────────────────────────────────
// component → optional peers, DERIVED from source (each component's real
// imports × the vite.config `external` list) rather than hand-maintained. This
// is the machine-readable source the MCP preflight/validate/verify tools read.
// The old hand-copied PEER_SPECS drifted from reality (dogfood 2026-07-10:
// missing sonner/remark-gfm/@emoji-mart, phantom @tiptap which is bundled);
// deriving eliminates the copy. `derive-peer-map.mjs --check` gates the recipe
// §2a tables against this same map.
const PEER_MAP = derivePeerMap().map

function peersFor(name) {
  return PEER_MAP[name] || []
}

// ── Component scanning (mirrors build-component-docs.mjs) ───────────────────

function isExcluded(filename) {
  if (filename.endsWith('.js')) return true
  if (filename.endsWith('.test.tsx') || filename.endsWith('.test.ts')) return true
  if (filename.endsWith('.stories.tsx') || filename.endsWith('.stories.ts')) return true
  if (filename.endsWith('.mdx')) return true
  if (filename === 'index.ts' || filename === 'index.tsx') return true
  if (filename.endsWith('-types.ts') || filename.endsWith('-types.tsx')) return true
  return false
}

function scanComponents(categoryDir) {
  const names = []
  let entries
  try {
    entries = readdirSync(categoryDir)
  } catch {
    return []
  }
  for (const entry of entries) {
    const fullPath = join(categoryDir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      names.push(entry)
      continue
    }
    if (!entry.endsWith('.tsx')) continue
    if (isExcluded(entry)) continue
    names.push(basename(entry, extname(entry)))
  }
  return [...new Set(names)].sort()
}

// ── Markdown section splitting ───────────────────────────────────────────────

/** Split a doc into { title, headerBullets, description, sections: {Name: body} }. */
function splitDoc(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let title = ''
  const headerBullets = {}
  const descriptionLines = []
  const sections = {}
  let current = null
  let pastHeader = false

  for (const line of lines) {
    const h1 = line.match(/^# (.+)$/)
    if (h1 && !title) {
      title = h1[1].trim()
      continue
    }
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      current = h2[1].trim()
      sections[current] = []
      pastHeader = true
      continue
    }
    if (current) {
      sections[current].push(line)
      continue
    }
    // Between H1 and first H2: header bullets + free description prose
    const bullet = line.match(/^- ([A-Za-z-]+):\s*(.+)$/)
    if (bullet && !pastHeader) {
      headerBullets[bullet[1].toLowerCase()] = bullet[2].trim()
      continue
    }
    if (line.trim()) descriptionLines.push(line.trim())
  }

  for (const k of Object.keys(sections)) sections[k] = sections[k].join('\n')
  return { title, headerBullets, description: descriptionLines.join(' '), sections }
}

// ── Props parsing ────────────────────────────────────────────────────────────

/**
 * Parse one prop line: `name: type-expression (parenthetical)`.
 * Type heuristics per standard §2: fully-quoted unions → enum; bare keywords →
 * scalar kinds; anything mixed → union/raw.
 */
function parsePropLine(line) {
  const m = line.match(/^\s{2,}([A-Za-z][A-Za-z0-9]*)\??:\s*(.+)$/)
  if (!m) return null
  const name = m[1]
  let rest = m[2].trim()

  let defaultValue
  let description = ''

  // Trailing parenthetical: `(default: X)` or `(description text)`
  let required = false
  const paren = rest.match(/^(.*?)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$/)
  if (paren && !rest.startsWith('(')) {
    const inner = paren[2].trim()
    const def = inner.match(/^default:\s*(.+)$/)
    if (/^required$/i.test(inner)) {
      required = true
      rest = paren[1].trim()
    } else if (def) {
      defaultValue = unquote(def[1].trim())
      rest = paren[1].trim()
    } else if (!paren[1].includes('=>')) {
      // Don't strip parens that are part of a function signature
      description = inner
      rest = paren[1].trim()
    }
  }

  const type = classifyType(rest)
  const prop = { type, required }
  if (defaultValue !== undefined) prop.defaultValue = coerce(defaultValue)
  if (description) prop.description = description
  return { name, prop }
}

function unquote(s) {
  return s.replace(/^["']|["']$/g, '')
}

function coerce(v) {
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  return unquote(String(v))
}

function classifyType(text) {
  const t = text.trim()
  if (t === 'boolean') return { name: 'boolean' }
  if (t === 'string') return { name: 'string' }
  if (t === 'number') return { name: 'number' }
  if (/^ReactNode\b/.test(t)) return { name: 'ReactNode' }
  if (/^ReactElement\b/.test(t)) return { name: 'ReactElement', raw: t }
  if (t.includes('=>')) return { name: 'function', raw: t }

  // Union of parts
  if (t.includes('|')) {
    const parts = t.split('|').map((p) => p.trim())
    const allQuoted = parts.every((p) => /^["'].*["']$/.test(p))
    if (allQuoted) return { name: 'enum', value: parts.map(unquote) }
    return { name: 'union', raw: t }
  }

  if (/^["'].*["']$/.test(t)) return { name: 'enum', value: [unquote(t)] }
  return { name: 'object', raw: t }
}

function parseProps(body) {
  const props = {}
  if (!body) return props
  for (const line of body.split('\n')) {
    const parsed = parsePropLine(line)
    if (parsed) props[parsed.name] = parsed.prop
  }
  return props
}

// ── Defaults parsing: `variant="solid", size="md"` lines ────────────────────

function parseDefaults(body) {
  const defaults = {}
  if (!body) return defaults
  for (const m of body.matchAll(/([A-Za-z][A-Za-z0-9]*)=["']?([^,"'\n]+)["']?/g)) {
    defaults[m[1]] = coerce(m[2].trim())
  }
  return defaults
}

// ── Example extraction: fenced code blocks, verbatim ────────────────────────

function parseExamples(body) {
  const examples = []
  if (!body) return examples
  for (const m of body.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
    const code = m[1].trimEnd()
    if (code) examples.push(code)
  }
  return examples
}

// ── Composability parsing: tagged bullets → structured; untagged → notes ────

const COMPOSITION_TAGS = {
  part: 'parts',
  slot: 'slots',
  composes: 'composesWith',
  'contained-by': 'containedBy',
  context: 'contexts',
}

const RELATIONS = new Set([
  'specializes', 'contains', 'pairs', 'provides-context', 'consumes-context', 'alternative-to',
])

function parseComposition(body) {
  const composition = {}
  const push = (key, value) => {
    if (!composition[key]) composition[key] = []
    composition[key].push(value)
  }
  if (!body) return composition

  // Bullets may wrap: continuation lines are indented, non-bullet lines
  const bullets = []
  for (const line of body.split('\n')) {
    if (/^- /.test(line)) bullets.push(line.slice(2))
    else if (line.trim() && bullets.length > 0) bullets[bullets.length - 1] += ' ' + line.trim()
  }

  for (const bullet of bullets) {
    const tagged = bullet.match(/^\*\*([A-Za-z-]+):\*\*\s*(.+)$/s)
    const tagKey = tagged ? COMPOSITION_TAGS[tagged[1].toLowerCase()] : null
    if (!tagKey) {
      push('notes', bullet.trim())
      continue
    }
    const text = tagged[2].trim()
    switch (tagKey) {
      case 'parts': {
        // `Name (slot: top, required) — description`
        const m = text.match(/^([A-Za-z][\w.]*)\s*(?:\(([^)]*)\))?\s*(?:—|-{2})?\s*(.*)$/s)
        const entry = { name: m ? m[1] : text }
        if (m?.[2]) {
          const slot = m[2].match(/slot:\s*([\w-]+)/)
          if (slot) entry.slot = slot[1]
          if (/\brequired\b/.test(m[2])) entry.required = true
        }
        if (m?.[3]) entry.description = m[3].trim()
        push('parts', entry)
        break
      }
      case 'slots': {
        // `name (accepts: A, B) — description`
        const m = text.match(/^([\w-]+)\s*(?:\(accepts:\s*([^)]*)\))?\s*(?:—|-{2})?\s*(.*)$/s)
        const entry = { name: m ? m[1] : text }
        if (m?.[2]) entry.accepts = m[2].split(',').map((s) => s.trim()).filter(Boolean)
        if (m?.[3]) entry.description = m[3].trim()
        push('slots', entry)
        break
      }
      case 'composesWith': {
        // `component-name (relation) — description`
        const m = text.match(/^([\w-]+)\s*\((\w[\w-]*)\)\s*(?:—|-{2})?\s*(.*)$/s)
        if (m && RELATIONS.has(m[2])) {
          const entry = { component: m[1], relation: m[2] }
          if (m[3]) entry.description = m[3].trim()
          push('composesWith', entry)
        } else {
          // Malformed relation → keep as note rather than emit invalid data
          push('notes', `Composes: ${text}`)
        }
        break
      }
      case 'containedBy': {
        for (const item of text.split(',')) {
          const v = item.trim().replace(/\.$/, '')
          if (v) push('containedBy', v)
        }
        break
      }
      case 'contexts': {
        // `Name — effect`
        const m = text.match(/^([A-Za-z][\w.]*)\s*(?:—|-{2})\s*(.+)$/s)
        if (m) push('contexts', { name: m[1], effect: m[2].trim() })
        else push('notes', `Context: ${text}`)
        break
      }
    }
  }
  return composition
}

// ── Gotchas + Changes ────────────────────────────────────────────────────────

function parseGotchas(body) {
  const gotchas = []
  if (!body) return gotchas
  for (const line of body.split('\n')) {
    if (/^- /.test(line)) gotchas.push(line.slice(2).trim())
    else if (line.trim() && gotchas.length > 0) gotchas[gotchas.length - 1] += ' ' + line.trim()
  }
  return gotchas
}

function parseChanges(body) {
  const changes = []
  if (!body) return changes
  let current = null
  for (const line of body.split('\n')) {
    const h = line.match(/^### v?(\d+\.\d+\.\d+)/)
    if (h) {
      current = { version: h[1], summary: '' }
      changes.push(current)
      continue
    }
    if (current && line.trim() && !current.summary) {
      current.summary = line.replace(/^- /, '').trim()
    }
  }
  return changes.filter((c) => c.summary)
}

// ── Token extraction (approach shared with figma-sync-tokens.mjs) ───────────

function extractVarsUnderSelector(css, selector) {
  const out = {}
  let searchFrom = 0
  while (true) {
    const idx = css.indexOf(selector, searchFrom)
    if (idx === -1) break
    const start = css.indexOf('{', idx)
    if (start === -1) break
    let depth = 1
    let i = start + 1
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++
      else if (css[i] === '}') depth--
      if (depth === 0) break
      i++
    }
    const body = css.slice(start + 1, i)
    for (const line of body.split('\n')) {
      const m = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+?);?\s*(?:\/\*.*\*\/)?\s*$/i)
      if (m) out[m[1]] = m[2].trim()
    }
    searchFrom = i + 1
  }
  return out
}

const TOKEN_CATEGORY_RULES = [
  { category: 'spacing', test: (n) => n.startsWith('--spacing-') },
  { category: 'typography', test: (n) => n.startsWith('--text-') || n.startsWith('--leading-') || n.startsWith('--font-') },
  { category: 'radius', test: (n) => n.startsWith('--radius') },
  { category: 'shadow', test: (n) => n.startsWith('--shadow-') },
  { category: 'motion', test: (n) => n.startsWith('--duration-') || n.startsWith('--animate-') || n.startsWith('--ease-') },
  { category: 'z', test: (n) => n.startsWith('--z-') },
  { category: 'color', test: (n) => n.startsWith('--color-') || n.startsWith('--background') || n.startsWith('--surface') },
]

function buildTokens() {
  const tokens = { color: [], spacing: [], typography: [], radius: [], shadow: [], motion: [], z: [] }
  const files = ['semantic.css', 'typography-semantic.css', 'animations.css']
  const light = {}
  const dark = {}

  for (const file of files) {
    let css
    try {
      css = readFileSync(join(ROOT, 'src', 'tokens', file), 'utf8')
    } catch {
      continue
    }
    Object.assign(light, extractVarsUnderSelector(css, '@theme'), extractVarsUnderSelector(css, ':root'))
    Object.assign(dark, extractVarsUnderSelector(css, '.dark'))
  }

  for (const [name, value] of Object.entries(light)) {
    const rule = TOKEN_CATEGORY_RULES.find((r) => r.test(name))
    if (!rule) continue
    const entry = { name, value }
    if (dark[name] && dark[name] !== value) entry.darkValue = dark[name]
    tokens[rule.category].push(entry)
  }
  return tokens
}

// ── Structural validation (schema-shaped; audit gate does full ajv pass) ────

function validateManifest(manifest) {
  const errors = []
  for (const key of ['manifestVersion', 'package', 'packageVersion', 'components', 'tokens']) {
    if (!(key in manifest)) errors.push(`missing top-level "${key}"`)
  }
  if (manifest.packageVersion !== JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version) {
    errors.push('packageVersion does not match package.json')
  }
  for (const [name, c] of Object.entries(manifest.components)) {
    for (const key of ['displayName', 'tier', 'import', 'serverSafe', 'description', 'props', 'composition', 'docPath']) {
      if (!(key in c)) errors.push(`${name}: missing "${key}"`)
    }
    if (!['ui', 'composed', 'shell', 'ai'].includes(c.tier)) errors.push(`${name}: invalid tier "${c.tier}"`)
    for (const rel of c.composition.composesWith ?? []) {
      if (!RELATIONS.has(rel.relation)) errors.push(`${name}: invalid relation "${rel.relation}"`)
    }
  }
  return errors
}

// ── Main ────────────────────────────────────────────────────────────────────

const checkOnly = process.argv.includes('--check')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

const components = {}
const stats = { total: 0, props: 0, taggedComposition: 0, notesOnly: 0, missingSections: [], peerDrift: [], peered: 0 }

for (const cat of CATEGORIES) {
  for (const name of scanComponents(join(ROOT, 'src', cat))) {
    const docPath = `docs/components/${cat}/${name}.md`
    let md
    try {
      md = readFileSync(join(ROOT, docPath), 'utf8')
    } catch {
      console.error(`FATAL: missing doc ${docPath} — run build-component-docs.mjs --check first`)
      process.exit(1)
    }

    const { title, headerBullets, description, sections } = splitDoc(md)
    const props = parseProps(sections['Props'])
    const defaults = parseDefaults(sections['Defaults'])
    // Backfill defaultValue from Defaults section
    for (const [p, v] of Object.entries(defaults)) {
      if (props[p] && props[p].defaultValue === undefined) props[p].defaultValue = v
    }
    const composition = parseComposition(sections['Composability'])
    // Existing `## Compound Components` sections are ready-made parts data:
    // indented tree lines like `AccordionItem (value: string, REQUIRED)`.
    if (sections['Compound Components'] && !composition.parts) {
      const parts = []
      for (const line of sections['Compound Components'].split('\n')) {
        const m = line.match(/^\s{2,}([A-Z][\w.]*)\s*(?:\(([^)]*)\))?/)
        if (!m) continue
        const part = { name: m[1] }
        if (m[2]) part.description = m[2].trim()
        parts.push(part)
      }
      if (parts.length) composition.parts = parts
    }

    const entry = {
      displayName: title || name,
      tier: cat,
      import: headerBullets['import'] || `@devalok/shilp-sutra/${cat}/${name}`,
      serverSafe: /^yes/i.test(headerBullets['server-safe'] || ''),
      description,
      props,
      composition,
      docPath,
    }
    if (Object.keys(defaults).length) entry.defaults = defaults
    const examples = parseExamples(sections['Example'])
    if (examples.length) entry.examples = examples
    const gotchas = parseGotchas(sections['Gotchas'])
    if (gotchas.length) entry.gotchas = gotchas
    const changes = parseChanges(sections['Changes'])
    if (changes.length) entry.changes = changes

    const peers = peersFor(name)
    if (peers.length) { entry.peers = peers; stats.peered++ }
    // Advisory: a component whose gotchas mention peers but whose derived map
    // has none means the source imports and the docs disagree — surface it.
    // (`derive-peer-map.mjs --check` is the hard gate; this is a soft nudge.)
    const mentionsPeer = gotchas.some((g) => /peer dependenc/i.test(g))
    if (mentionsPeer && !peers.length) stats.peerDrift.push(name)

    components[name] = entry
    stats.total++
    stats.props += Object.keys(props).length
    const structuredKeys = Object.keys(composition).filter((k) => k !== 'notes')
    if (structuredKeys.length > 0) stats.taggedComposition++
    else if (composition.notes?.length) stats.notesOnly++
    for (const required of ['Props', 'Example']) {
      if (!sections[required]) stats.missingSections.push(`${docPath}: no ## ${required}`)
    }
  }
}

// No generatedAt: output must be deterministic so the audit gate can diff
// the committed manifest against a fresh run to catch stale regeneration.
const manifest = {
  $schema: './mcp-manifest.schema.json',
  manifestVersion: MANIFEST_VERSION,
  package: pkg.name,
  packageVersion: pkg.version,
  components,
  tokens: buildTokens(),
}

const errors = validateManifest(manifest)
if (errors.length) {
  console.error(`mcp-manifest structural validation failed (${errors.length}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

// ── Router llms.txt: hand-authored preamble template + generated index ──────

function buildLlmsRouter(manifest) {
  const template = readFileSync(join(ROOT, 'docs', 'llms.template.md'), 'utf8').replace(/\r\n/g, '\n')
  const lines = []
  for (const tier of CATEGORIES) {
    const names = Object.keys(manifest.components)
      .filter((n) => manifest.components[n].tier === tier)
      .sort()
    if (!names.length) continue
    lines.push(`### ${tier}`)
    for (const name of names) {
      const c = manifest.components[name]
      if (/internal sub-component/i.test(c.description)) continue
      const desc = c.description ? `: ${c.description.replace(/^>\s*/, '').split('. ')[0].replace(/\.$/, '')}` : ''
      lines.push(`- [${name}](${c.docPath})${desc}`)
    }
    lines.push('')
  }
  return template
    .replace('{{VERSION}}', manifest.packageVersion)
    .replace('{{COMPONENT_INDEX}}', lines.join('\n').trimEnd())
}

if (!checkOnly) {
  writeFileSync(join(ROOT, 'mcp-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  const router = buildLlmsRouter(manifest)
  writeFileSync(join(ROOT, 'llms.txt'), router, 'utf8')
  const routerTokens = Math.ceil(router.length / 4)
  console.log(`llms.txt (router) generated — ~${routerTokens} tokens.`)
  if (routerTokens > 3500) {
    console.error(`FATAL: router llms.txt is ~${routerTokens} tokens; standard caps it at ~3K. Trim the template or index.`)
    process.exit(1)
  }
}

const tokenCount = Object.values(manifest.tokens).reduce((n, arr) => n + arr.length, 0)
console.log(
  `mcp-manifest${checkOnly ? ' (check)' : '.json generated'} — ${stats.total} components, ` +
    `${stats.props} props, ${tokenCount} tokens. ` +
    `Composition: ${stats.taggedComposition} tagged, ${stats.notesOnly} notes-only. ` +
    `Peers: ${stats.peered} components with optional peers.`
)
if (stats.peerDrift.length) {
  console.log(
    `Advisory — ${stats.peerDrift.length} component(s) mention peer deps in gotchas but have no PEER_SPECS entry ` +
      `(map may have drifted from the recipe table): ${stats.peerDrift.join(', ')}`
  )
}
if (stats.missingSections.length) {
  console.log(`Advisory — ${stats.missingSections.length} docs missing sections:`)
  for (const m of stats.missingSections.slice(0, 10)) console.log(`  - ${m}`)
  if (stats.missingSections.length > 10) console.log(`  … +${stats.missingSections.length - 10} more`)
}
