/**
 * tools.mjs — the six tool implementations over a fetched doc set.
 *
 * Conventions (docs/specs/mcp-manifest-standard.md §3):
 * - every response starts with a version banner
 * - machine data as JSON, prose as Markdown
 * - ≤ ~5K tokens (~20K chars) per response, explicit truncation marker
 * - errors are written for LLM self-correction
 * - versions below the 0.45 floor get a guidance redirect, except `upgrade`
 */

import { getDocs } from './registry.mjs'
import * as github from './github.mjs'

const FLOOR = '0.45.0'
const MAX_CHARS = 20_000

function cmpSemver(a, b) {
  const pa = a.split('-')[0].split('.').map(Number)
  const pb = b.split('-')[0].split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0)
  }
  return 0
}

function banner(version) {
  return `Docs for @devalok/shilp-sutra@${version}. If the consumer app has a different version installed (check node_modules/@devalok/shilp-sutra/package.json), pass it as the \`version\` parameter — prop surfaces change between minors.\n\n`
}

function cap(text) {
  if (text.length <= MAX_CHARS) return text
  return (
    text.slice(0, MAX_CHARS) +
    `\n\n[truncated: true — response hit the 5K-token budget. Narrow the request (specific component, sections parameter, or a more precise query).]`
  )
}

function floorRedirect(version) {
  return (
    banner(version) +
    `Version ${version} predates MCP doc coverage (floor ${FLOOR}). ` +
    `Call upgrade(from: "${version}", to: "${FLOOR}") for the migration path, ` +
    `or read the docs shipped inside the installed package at node_modules/@devalok/shilp-sutra/ (llms.txt, docs/components/).`
  )
}

function getManifest(files) {
  const raw = files.get('mcp-manifest.json')
  return raw ? JSON.parse(raw) : null
}

/** Shared preamble: fetch docs, apply floor. Returns {version, files, manifest} or {redirect}. */
async function load(version, { skipFloor = false } = {}) {
  const docs = await getDocs(version)
  if (!skipFloor && !docs.local && cmpSemver(docs.version, FLOOR) < 0) {
    return { redirect: floorRedirect(docs.version) }
  }
  return { ...docs, manifest: getManifest(docs.files) }
}

function componentNotFound(name, manifest) {
  const names = Object.keys(manifest.components)
  const close = names.filter((n) => n.includes(name) || name.includes(n)).slice(0, 5)
  return (
    `Unknown component "${name}".` +
    (close.length ? ` Closest: ${close.join(', ')}.` : '') +
    ` Call find_component("${name}") to search all ${names.length} components.`
  )
}

// ── Tools ────────────────────────────────────────────────────────────────────

export async function findComponent({ query = '', tier, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const q = query.toLowerCase().trim()
  const rows = []
  for (const [name, c] of Object.entries(d.manifest.components)) {
    if (tier && c.tier !== tier) continue
    if (/internal sub-component/i.test(c.description)) continue
    const hay = `${name} ${c.displayName} ${c.description}`.toLowerCase()
    if (q && !q.split(/\s+/).some((term) => hay.includes(term))) continue
    rows.push({ name, tier: c.tier, description: c.description || undefined, import: c.import })
  }
  const body =
    rows.length === 0
      ? `No components matched "${query}". Try broader terms, or call find_component with no query for the full list.`
      : '```json\n' + JSON.stringify(rows, null, 1) + '\n```'
  return cap(banner(d.version) + body)
}

const SECTIONS = ['api', 'usage', 'examples', 'composition', 'changelog']

export async function getComponent({ name, sections, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const c = d.manifest.components[name]
  if (!c) return banner(d.version) + componentNotFound(name, d.manifest)

  const want = sections?.length ? sections : SECTIONS
  const out = [banner(d.version) + `# ${c.displayName} (${c.tier})\nImport: \`${c.import}\` · Server-safe: ${c.serverSafe ? 'yes' : 'no'}`]
  if (c.description) out.push(c.description)

  if (want.includes('api')) {
    out.push('## API (JSON)\n```json\n' + JSON.stringify({ props: c.props, defaults: c.defaults }, null, 1) + '\n```')
  }
  if (want.includes('usage') && c.gotchas?.length) {
    out.push('## Usage rules & gotchas\n' + c.gotchas.map((g) => `- ${g}`).join('\n'))
  }
  if (want.includes('examples') && c.examples?.length) {
    out.push('## Examples\n' + c.examples.map((e) => '```jsx\n' + e + '\n```').join('\n'))
  }
  if (want.includes('composition')) {
    out.push('## Composition (JSON)\n```json\n' + JSON.stringify(c.composition, null, 1) + '\n```')
  }
  if (want.includes('changelog') && c.changes?.length) {
    out.push('## Changes\n' + c.changes.map((ch) => `- v${ch.version}: ${ch.summary}`).join('\n'))
  }
  return cap(out.join('\n\n'))
}

export async function getTokens({ category, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const tokens = d.manifest.tokens
  if (!category) {
    const summary = Object.fromEntries(Object.entries(tokens).map(([k, v]) => [k, v.length]))
    return (
      banner(d.version) +
      'Token categories (pass one as `category` for the full list):\n```json\n' +
      JSON.stringify(summary, null, 1) +
      '\n```'
    )
  }
  if (!tokens[category]) {
    return banner(d.version) + `Unknown category "${category}". Valid: ${Object.keys(tokens).join(', ')}.`
  }
  return cap(banner(d.version) + '```json\n' + JSON.stringify(tokens[category], null, 1) + '\n```')
}

const FRAMEWORKS = ['vite', 'next-app-router', 'next-pages', 'remix', 'astro', 'tanstack-start']

export async function getSetup({ framework, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  if (!framework) {
    return (
      banner(d.version) +
      `Pass \`framework\` for the full install recipe. Available: ${FRAMEWORKS.join(', ')}. ` +
      `Also available via get_setup: customize-brand, server-components, troubleshoot, upgrading.`
    )
  }
  const candidates = [`docs/recipes/install-${framework}.md`, `docs/recipes/${framework}.md`]
  const recipe = candidates.map((p) => d.files.get(p)).find(Boolean)
  if (!recipe) {
    return banner(d.version) + `No recipe for "${framework}". Valid: ${FRAMEWORKS.join(', ')}, customize-brand, server-components, troubleshoot, upgrading.`
  }
  return cap(banner(d.version) + recipe)
}

export async function upgrade({ from, to, version }) {
  // Exempt from the floor: this is the doorway IN for pre-0.45 consumers.
  // Breaking data is read from the TARGET version's tarball (cumulative manifest).
  const d = await load(to || version, { skipFloor: true })
  const breakingRaw = d.files.get('BREAKING.json')
  if (!breakingRaw) return banner(d.version) + 'BREAKING.json missing from this version — read MIGRATION.md in the installed package.'
  const breaking = JSON.parse(breakingRaw)
  const target = to || d.version
  const inRange = Object.entries(breaking.versions)
    .filter(([v]) => cmpSemver(v, from) > 0 && cmpSemver(v, target) <= 0)
    .sort(([a], [b]) => cmpSemver(a, b))
  const header =
    banner(d.version) +
    `Breaking changes upgrading ${from} → ${target}` +
    (inRange.length ? ':' : ': none recorded. Still read CHANGELOG.md for behavioral changes.')
  const body = inRange.length ? '\n```json\n' + JSON.stringify(Object.fromEntries(inRange), null, 1) + '\n```' : ''
  const tail = inRange.length
    ? '\n\nEach entry\'s `migrationDoc` anchors into MIGRATION.md (ships in the package). Run typecheck + build after upgrading — many breaks are type-level.'
    : ''
  return cap(header + body + tail)
}

export async function searchDocs({ query, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return banner(d.version) + 'Empty query. Pass search terms, e.g. search_docs("focus ring").'

  const hits = []
  for (const [path, content] of d.files) {
    if (!path.startsWith('docs/')) continue
    for (const section of content.split(/^## /m)) {
      const score = terms.reduce((n, t) => n + (section.toLowerCase().includes(t) ? 1 : 0), 0)
      if (score === terms.length) {
        hits.push({ path, heading: section.split('\n')[0].trim(), excerpt: section.slice(0, 700).trim(), score })
      }
    }
  }
  hits.sort((a, b) => b.score - a.score)
  const top = hits.slice(0, 5)
  const body = top.length
    ? top.map((h) => `### ${h.path} — ${h.heading}\n${h.excerpt}`).join('\n\n---\n\n') +
      (hits.length > 5 ? `\n\n(${hits.length - 5} more matches — narrow the query.)` : '')
    : `No sections matched "${query}". Try find_component for component names, or broader terms.`
  return cap(banner(d.version) + body)
}

// ── report_issue (the one write path) ─────────────────────────────────────────

const CAP = { title: 150, body: 6000, reproduction: 4000 }
const CATEGORY_LABEL = { bug: 'bug', feature: 'enhancement', suggestion: 'enhancement', docs: 'documentation' }
const SEVERITY_LABEL = { urgent: 'urgent', normal: 'normal', 'nice-to-have': 'nice-to-have' }
const FRAMEWORK_LABEL = {
  vite: 'framework:vite',
  'next-app': 'framework:next-app',
  'next-pages': 'framework:next-pages',
  astro: 'framework:astro',
  remix: 'framework:remix',
  tanstack: 'framework:tanstack',
  other: 'framework:other',
}

function clip(s, n) {
  return s.length > n ? s.slice(0, n) + '\n\n[…truncated by report_issue char cap]' : s
}

/**
 * Create a GitHub issue on behalf of an AI agent that hit a wall using shilp-sutra.
 * The one write path on an otherwise read-only server: guarded by a per-IP hourly
 * write limit (ctx.checkWriteLimit), title-dedup, content caps, and a `mcp-submitted`
 * label so maintainers know it arrived unvetted.
 */
export async function reportIssue(args, ctx = {}) {
  const { category, title, body, reproduction, component, framework, severity, version } = args

  if (!github.configured) {
    throw new Error(
      'Feedback submission is not enabled on this server (GitHub App not configured). ' +
        'File manually at https://github.com/' + github.feedbackRepo + '/issues/new/choose.'
    )
  }
  ctx.checkWriteLimit?.()

  const t = (title || '').trim()
  const b = (body || '').trim()
  if (!t) throw new Error('`title` is required — a one-line summary of the bug/suggestion.')
  if (!b) throw new Error('`body` is required — describe what happened / what you want and why.')
  if (!CATEGORY_LABEL[category]) {
    throw new Error(`\`category\` must be one of: ${Object.keys(CATEGORY_LABEL).join(', ')}.`)
  }

  // Dedup against open issues so retries/loops don't spawn duplicates.
  const dupTitle = clip(t, CAP.title)
  const dup = await github.findDuplicate(dupTitle)
  if (dup) {
    return (
      `A matching open issue already exists: #${dup.number} — ${dup.html_url}\n\n` +
      'Not filing a duplicate. Comment on that issue instead, or refine the title if this is genuinely different.'
    )
  }

  const meta = [
    `**Category:** ${category}`,
    component ? `**Component:** ${component}` : null,
    version ? `**shilp-sutra version:** ${version}` : null,
    framework ? `**Framework:** ${framework}` : null,
    severity ? `**Reported severity:** ${severity}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const issueBody = [
    '<!-- filed via the shilp-sutra MCP `report_issue` tool -->',
    meta,
    '## Description\n' + clip(b, CAP.body),
    reproduction ? '## Reproduction\n' + clip(reproduction.trim(), CAP.reproduction) : null,
    '---\n_Filed by an AI coding agent via the shilp-sutra MCP `report_issue` tool. Unvetted — pending maintainer triage._',
  ]
    .filter(Boolean)
    .join('\n\n')

  const labels = ['agent-filed', 'needs-triage', 'mcp-submitted', CATEGORY_LABEL[category]]
  if (framework && FRAMEWORK_LABEL[framework]) labels.push(FRAMEWORK_LABEL[framework])
  if (severity && SEVERITY_LABEL[severity]) labels.push(SEVERITY_LABEL[severity])

  const created = await github.createIssue({ title: `[${category}] ${dupTitle}`, body: issueBody, labels: [...new Set(labels)] })
  return (
    `Filed issue #${created.number}: ${created.html_url}\n\n` +
    'A maintainer will triage it (label `needs-triage`). Thanks — this feedback improves the design system.'
  )
}
