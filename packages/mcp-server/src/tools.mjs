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

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from '@babel/parser'

import { getDocs } from './registry.mjs'
import * as github from './github.mjs'
import * as buildathon from './buildathon.mjs'

const FLOOR = '0.45.0'
const MAX_CHARS = 20_000

const HERE = dirname(fileURLToPath(import.meta.url))
const SLOP_CORPUS = JSON.parse(readFileSync(join(HERE, 'slop-corpus.json'), 'utf8'))
const SLOP_GUIDANCE = JSON.parse(readFileSync(join(HERE, 'slop-guidance.json'), 'utf8'))

function cmpSemver(a, b) {
  const pa = a.split('-')[0].split('.').map(Number)
  const pb = b.split('-')[0].split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0)
  }
  return 0
}

function banner(version) {
  // The buildathon line self-expires at the deadline (see buildathon.mjs), so
  // this cannot end up advertising a finished competition.
  return (
    `Docs for @devalok/shilp-sutra@${version}. If the consumer app has a different version installed (check node_modules/@devalok/shilp-sutra/package.json), pass it as the \`version\` parameter — prop surfaces change between minors.\n\n` +
    buildathon.bannerNotice()
  )
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
    const api = { props: c.props, defaults: c.defaults }
    // subComponents carries props that belong to a compound child (e.g. `numeric`
    // is a TableCell/TableHead prop, not a <Table> prop). Emitting them here —
    // keyed by the owning subcomponent — stops agents writing `<Table numeric>`
    // or `<TableRow href>` and hitting TS2322 (#132).
    if (c.subComponents) api.subComponents = c.subComponents
    out.push('## API (JSON)\n```json\n' + JSON.stringify(api, null, 1) + '\n```')
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

// ── Setup-journey tools: preflight · validate_snippet · detect_framework · verify_setup ──
//
// These close the four agent-driven-setup failure modes the reference tools
// don't: peer-dep cliffs, TW4 dead classes, framework mis-detection, and the
// "build passed but is it wired right" blind spot.

const RECIPE_FRAMEWORKS = ['vite', 'next-app-router', 'next-pages', 'remix', 'astro', 'tanstack-start']

const PM = {
  pnpm: { add: 'pnpm add', addDev: 'pnpm add -D' },
  npm: { add: 'npm install', addDev: 'npm install -D' },
  yarn: { add: 'yarn add', addDev: 'yarn add -D' },
  bun: { add: 'bun add', addDev: 'bun add -d' },
}

// Core install per framework — mirrors each recipe's §2. next-* also pulls
// next-themes and uses the PostCSS Tailwind plugin; the Vite-family uses the
// Vite plugin.
const FRAMEWORK_INSTALL = {
  'next-app-router': { core: ['@devalok/shilp-sutra', 'framer-motion', 'next-themes'], dev: ['tailwindcss@^4', '@tailwindcss/postcss'] },
  'next-pages': { core: ['@devalok/shilp-sutra', 'framer-motion', 'next-themes'], dev: ['tailwindcss@^4', '@tailwindcss/postcss'] },
  vite: { core: ['@devalok/shilp-sutra', 'framer-motion'], dev: ['tailwindcss@^4', '@tailwindcss/vite'] },
  remix: { core: ['@devalok/shilp-sutra', 'framer-motion'], dev: ['tailwindcss@^4', '@tailwindcss/vite'] },
  astro: { core: ['@devalok/shilp-sutra', 'framer-motion'], dev: ['tailwindcss@^4', '@tailwindcss/vite'] },
  'tanstack-start': { core: ['@devalok/shilp-sutra', 'framer-motion'], dev: ['tailwindcss@^4', '@tailwindcss/vite'] },
}

function pmFor(name) {
  return PM[name] || PM.pnpm
}

/** PascalCase/camel → kebab. */
function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Resolve an import specifier OR a component name to a kebab component name.
 * Returns { name } or { barrel: true } (imported from the layer barrel — itself
 * a peer-cliff hazard) or { name: null } for shapes we can't map.
 */
function resolveComponent(spec) {
  let s = String(spec).trim().replace(/['"]/g, '').replace(/^@devalok\/shilp-sutra\/?/, '')
  if (!s) return { name: null }
  const parts = s.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (['ui', 'composed', 'shell', 'ai'].includes(last)) return { barrel: true }
  return { name: kebab(last) }
}

function peersOf(component) {
  return Array.isArray(component?.peers) ? component.peers : []
}

// ── preflight ────────────────────────────────────────────────────────────────

export async function preflight({ framework, imports = [], packageManager, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const pm = pmFor(packageManager)

  const list = Array.isArray(imports) ? imports : [imports].filter(Boolean)
  const requiredPeers = new Set()
  const unknown = []
  const barrelHazards = []
  const perImport = []

  for (const spec of list) {
    const r = resolveComponent(spec)
    if (r.barrel) { barrelHazards.push(spec); continue }
    if (!r.name) { unknown.push(spec); continue }
    const c = d.manifest.components[r.name]
    if (!c) { unknown.push(spec); continue }
    const peers = peersOf(c)
    peers.forEach((p) => requiredPeers.add(p))
    perImport.push({ import: c.import, peers })
  }

  const out = [banner(d.version) + '# preflight']

  if (framework && FRAMEWORK_INSTALL[framework]) {
    const fi = FRAMEWORK_INSTALL[framework]
    out.push(
      `## Base install (${framework})\n\`\`\`bash\n${pm.add} ${fi.core.join(' ')}\n${pm.addDev} ${fi.dev.join(' ')}\n\`\`\`\n` +
        'Full wiring (config, CSS, providers): call get_setup(framework).'
    )
  } else if (framework) {
    out.push(`Unknown framework "${framework}". Valid: ${RECIPE_FRAMEWORKS.join(', ')}. Skipping base-install block.`)
  }

  if (requiredPeers.size) {
    out.push(
      '## Required optional peers for these imports\n' +
        'These components import third-party libraries shipped as OPTIONAL peers. Install BEFORE first import or the build fails with `Failed to resolve import`.\n' +
        '```bash\n' + `${pm.add} ${[...requiredPeers].join(' ')}\n` + '```\n' +
        '```json\n' + JSON.stringify(perImport.filter((p) => p.peers.length), null, 1) + '\n```'
    )
  } else if (list.length) {
    out.push('## Peers\nNone of the resolved imports need optional peers — the base install covers them.')
  }

  if (barrelHazards.length) {
    out.push(
      '## ⚠ Barrel imports\n' +
        `Imported from a layer barrel: ${barrelHazards.join(', ')}. Peer-cliff components (data-table, charts, date-picker, rich-text-editor, input-otp, file-preview, markdown-viewer) are barrel-isolated — import the exact subpath (e.g. \`@devalok/shilp-sutra/ui/data-table\`) so peers resolve and the client bundle stays lean.`
    )
  }
  if (unknown.length) {
    out.push(`## Unresolved\nCould not map: ${unknown.join(', ')}. Call find_component to get exact names/import paths.`)
  }
  out.push('Tabler icons (`Icon`/`IconButton` with `@tabler/icons-react`): install `@tabler/icons-react` only if you pass Tabler icons — it is not bundled.')

  return cap(out.join('\n\n'))
}

// ── validate_snippet ───────────────────────────────────────────────────────────

// TW4 dead-class / removed-API rules. Mirrors @devalok/eslint-plugin-shilp-sutra
// (no-bare-shadow, no-deprecated-shadow-token, no-deprecated-surface-token,
// no-bg-gradient-to, no-css-var-bracket, no-tailwind-config-preset). Authoritative
// maps live in the plugin; keep in sync.
const DEAD_CLASS_RULES = [
  { re: /\bshadow-0[1-5]\b/g, msg: 'Numeric `shadow-0N` aliases were renamed in 0.23.0.', fix: '01→shadow-raised, 02→shadow-raised-hover, 03→shadow-floating, 04→shadow-overlay, 05 removed.' },
  { re: /(?<![\w-])(?:bg|border|text|ring|outline|divide|fill|stroke)-surface-[1-4](?![\w-])/g, msg: 'Numeric `-surface-N` aliases were removed in 0.23.0.', fix: 'surface-1→surface-base, 2→surface-raised, 3→surface-raised-hover, 4→surface-raised-active.' },
  { re: /(?<![\w-])(?:(?:hover|focus|active|disabled|group-hover|dark):)*shadow(?![\w-])/g, msg: 'Bare `shadow` renders no shadow in TW4 (no --shadow-DEFAULT).', fix: 'shadow-raised (cards/panels), shadow-floating (dropdowns/popovers), shadow-overlay (dialogs/sheets).' },
  { re: /\bbg-gradient-to-[a-z]{1,2}\b/g, msg: '`bg-gradient-to-*` is dead in TW4.', fix: 'Use `bg-linear-to-*` (e.g. bg-linear-to-r).' },
  { re: /(?<![\w-])(?:w|h|min-w|min-h|max-w|max-h|size|p|px|py|pt|pb|pl|pr|m|mx|my|gap|top|left|right|bottom|inset|translate-x|translate-y)-\[--[\w-]+\]/g, msg: 'TW3 arbitrary CSS-var syntax `-[--x]` is dead in TW4.', fix: 'Use the shorthand `-(--x)` (e.g. `w-(--sidebar-width)`).' },
  { re: /@devalok\/shilp-sutra\/tailwind\b/g, msg: 'The `/tailwind` JS preset export was removed in 0.38.', fix: 'Delete the import. TW4 is CSS-first: `@import "@devalok/shilp-sutra/css";`.' },
  { re: /theme\(\s*spacing\./g, msg: '`theme(spacing.N)` inside arbitrary values is dead in TW4.', fix: 'Use the literal value.' },
  { re: /presets:\s*\[\s*[A-Za-z]/g, msg: 'JS preset (`presets: [...]`) was removed in 0.38.', fix: 'Remove the tailwind.config preset; use CSS-first `@import "@devalok/shilp-sutra/css";`.' },
]

// Deprecated Button-family prop values (mirrors no-deprecated-button-variant).
const DEPRECATED_BUTTON = [
  { re: /<(?:Button|SplitButton|IconButton|ButtonGroup)\b[^>]*\bvariant=["']default["']/g, msg: '`variant="default"` was removed in 0.32.0.', fix: 'variant="solid".' },
  { re: /<(?:Button|SplitButton|IconButton|ButtonGroup)\b[^>]*\bvariant=["']destructive["']/g, msg: '`variant="destructive"` was removed in 0.32.0.', fix: 'variant="solid" color="error".' },
  { re: /<(?:Button|SplitButton|IconButton|ButtonGroup)\b[^>]*\bcolor=["']default["']/g, msg: '`color="default"` was removed in 0.32.0.', fix: 'color="accent".' },
]

export async function validateSnippet({ code, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  if (!code || !String(code).trim()) {
    return banner(d.version) + 'Pass `code` — the JSX/TSX/CSS you are about to write. Returns TW4 / prop / peer problems before you commit it.'
  }
  const src = String(code)
  const findings = []

  for (const rule of [...DEAD_CLASS_RULES, ...DEPRECATED_BUTTON]) {
    const seen = new Set()
    for (const m of src.matchAll(rule.re)) {
      const hit = m[0].trim()
      if (seen.has(hit)) continue
      seen.add(hit)
      findings.push({ severity: 'error', found: hit, issue: rule.msg, fix: rule.fix })
    }
  }

  // Barrel imports of peer-cliff components.
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@devalok\/shilp-sutra\/(ui|composed|shell|ai)["']/g)) {
    const named = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
    for (const n of named) {
      const c = d.manifest.components[kebab(n)]
      if (c && peersOf(c).length) {
        findings.push({
          severity: 'error',
          found: `import { ${n} } from ".../${m[2]}"`,
          issue: `${n} is barrel-isolated (needs peers ${peersOf(c).join(', ')}); the ${m[2]} barrel import will fail to resolve or bloat the bundle.`,
          fix: `Import the subpath: \`${c.import}\`, and install its peers (preflight).`,
        })
      }
    }
  }

  // Enum prop values against the manifest (+ collect imported peer components).
  const importedPeers = new Set()
  for (const m of src.matchAll(/import\s*\{[^}]*\}\s*from\s*["'](@devalok\/shilp-sutra\/[^"']+)["']/g)) {
    const c = d.manifest.components[resolveComponent(m[1]).name]
    peersOf(c).forEach((p) => importedPeers.add(p))
  }
  const BUTTON_FAMILY = new Set(['Button', 'SplitButton', 'IconButton', 'ButtonGroup'])
  for (const tag of src.matchAll(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)\/?>/g)) {
    const c = d.manifest.components[kebab(tag[1])]
    if (!c) continue
    for (const a of tag[2].matchAll(/([a-z][A-Za-z0-9]*)=["']([^"']*)["']/g)) {
      const prop = c.props?.[a[1]]
      // The DEPRECATED_BUTTON rules above own these removed values with a
      // migration fix — don't also report them as generic invalid-enum.
      if (BUTTON_FAMILY.has(tag[1]) && ['variant', 'color'].includes(a[1]) && ['default', 'destructive'].includes(a[2])) continue
      if (prop?.type?.name === 'enum' && Array.isArray(prop.type.value) && !prop.type.value.map(String).includes(a[2])) {
        findings.push({
          severity: 'error',
          found: `<${tag[1]} ${a[1]}="${a[2]}">`,
          issue: `"${a[2]}" is not a valid ${tag[1]}.${a[1]} value.`,
          fix: `Allowed: ${prop.type.value.join(', ')}.`,
        })
      }
    }
  }

  const out = [banner(d.version) + '# validate_snippet']
  if (findings.length) {
    out.push(`${findings.length} issue(s) — fix before writing:\n\`\`\`json\n${JSON.stringify(findings, null, 1)}\n\`\`\``)
  } else {
    out.push('No TW4 dead-class, deprecated-prop, or barrel-peer issues found.')
  }
  if (importedPeers.size) {
    out.push(`Peer reminder: imported components need these installed — ${[...importedPeers].join(', ')}. Confirm with verify_setup or preflight.`)
  }
  return cap(out.join('\n\n'))
}

// ── detect_framework ───────────────────────────────────────────────────────────

export async function detectFramework({ packageJson, hasAppDir, hasPagesDir, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect

  let pkg = packageJson
  if (typeof pkg === 'string') {
    try { pkg = JSON.parse(pkg) } catch { return banner(d.version) + 'Could not parse `packageJson`. Pass the file contents (JSON) or the parsed object.' }
  }
  if (!pkg || typeof pkg !== 'object') {
    return banner(d.version) + 'Pass `packageJson` (the consumer app package.json, as JSON string or object). Optionally `hasAppDir`/`hasPagesDir` for Next routing.'
  }
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const has = (n) => n in deps

  // Package manager: packageManager field wins, else unknown.
  let pm = 'pnpm'
  if (typeof pkg.packageManager === 'string') pm = pkg.packageManager.split('@')[0]
  if (!PM[pm]) pm = 'pnpm'

  let recipe = null
  let note = ''
  if (has('@tanstack/react-start')) {
    recipe = 'tanstack-start'
  } else if (has('@tanstack/start')) {
    recipe = 'tanstack-start'
    note = 'Detected the RETIRED Vinxi package @tanstack/start. Migrate to @tanstack/react-start (Vite plugin) — the current recipe assumes it.'
  } else if (has('@remix-run/react')) {
    recipe = 'remix'
    note = 'Remix v2. Note: new Remix projects now scaffold as React Router — if this is React Router v7+, use the vite recipe instead.'
  } else if (has('next')) {
    if (hasPagesDir && !hasAppDir) { recipe = 'next-pages' }
    else if (hasAppDir) { recipe = 'next-app-router' }
    else { recipe = 'next-app-router'; note = 'Defaulted to App Router (create-next-app 13+ default). If the app uses a pages/ directory with route files, use next-pages instead — pass hasPagesDir.' }
  } else if (has('astro')) {
    recipe = 'astro'
  } else if (has('@remix-run/dev')) {
    recipe = 'remix'
  } else if (has('vite') && (has('react') || has('react-dom'))) {
    recipe = 'vite'
    if (has('react-router') || has('react-router-dom')) note = 'Vite + React Router — the vite recipe is router-agnostic and covers it.'
  } else if (has('react-router') && has('react-dom')) {
    recipe = 'vite'
    note = 'React Router (v7+) app — use the vite recipe (RR runs on Vite; the DS is router-agnostic).'
  }

  if (!recipe) {
    return cap(
      banner(d.version) +
        '# detect_framework\nCould not detect a supported framework from dependencies. ' +
        `Supported: ${RECIPE_FRAMEWORKS.join(', ')}. Deps seen: ${Object.keys(deps).slice(0, 30).join(', ') || 'none'}.`
    )
  }
  return cap(
    banner(d.version) +
      '# detect_framework\n' +
      '```json\n' + JSON.stringify({ recipe, packageManager: pm, note: note || undefined }, null, 1) + '\n```\n' +
      `Next: call get_setup("${recipe}") for the full recipe, and preflight({ framework: "${recipe}", imports: [...] }) for peer installs.`
  )
}

// ── verify_setup ───────────────────────────────────────────────────────────────

// CSS comments do NOT nest: in `/* a /* b */ c */` the first `*/` closes the
// comment and ` c */` becomes stray tokens that corrupt the following rule, which
// the build then silently drops (warning only, exit 0). A pasted Themer block
// whose header carries a nested comment loses its entire `:root{}` accent/radius
// override this way — the brand color never applies. Flag it here.
function hasNestedComment(css) {
  let inComment = false
  for (let i = 0; i < css.length - 1; i++) {
    const two = css[i] + css[i + 1]
    if (!inComment && two === '/*') { inComment = true; i++; continue }
    if (inComment && two === '/*') return true // second open before the first close
    if (inComment && two === '*/') { inComment = false; i++; continue }
  }
  return false
}

export async function verifySetup({ framework, globalsCss, nextConfig, imports = [], installedDeps, version }) {
  const d = await load(version)
  if (d.redirect) return d.redirect
  const checks = []
  const pass = (name) => checks.push({ check: name, status: 'pass' })
  const fail = (name, fix) => checks.push({ check: name, status: 'FAIL', fix })

  if (globalsCss != null) {
    const css = String(globalsCss)
    const twIdx = css.indexOf('@import "tailwindcss"') >= 0 ? css.indexOf('@import "tailwindcss"') : css.indexOf("@import 'tailwindcss'")
    const ssIdx = Math.max(css.indexOf('@devalok/shilp-sutra/css'), -1)
    if (twIdx < 0) fail('CSS imports tailwindcss', 'Add `@import "tailwindcss";` as the FIRST import in your global CSS.')
    else pass('CSS imports tailwindcss')
    if (ssIdx < 0) fail('CSS imports @devalok/shilp-sutra/css', 'Add `@import "@devalok/shilp-sutra/css";` after the tailwindcss import.')
    else pass('CSS imports @devalok/shilp-sutra/css')
    if (twIdx >= 0 && ssIdx >= 0) {
      if (twIdx < ssIdx) pass('CSS import order (tailwindcss before shilp-sutra)')
      else fail('CSS import order', '`@import "tailwindcss"` MUST come before `@import "@devalok/shilp-sutra/css"`, or no DS utilities generate.')
    }
    if (hasNestedComment(css)) fail('CSS has no nested comments', 'A block in your CSS contains a nested `/* ... */` comment. CSS comments do not nest — the first `*/` closes early and the rule that follows (often your pasted accent/token override) is silently dropped at build, so the brand color never applies. Remove the inner comment.')
    else pass('CSS comment hygiene')
  } else {
    checks.push({ check: 'CSS', status: 'skipped', note: 'Pass `globalsCss` to verify the two imports + order.' })
  }

  if (framework === 'next-app-router' || framework === 'next-pages') {
    if (nextConfig != null) {
      const cfg = String(nextConfig)
      if (/transpilePackages/.test(cfg) && /@devalok\/shilp-sutra/.test(cfg)) pass('next.config transpilePackages includes @devalok/shilp-sutra')
      else fail('next.config transpilePackages', 'Add `transpilePackages: ["@devalok/shilp-sutra"]` to next.config — without it Next refuses the prebuilt ESM.')
    } else {
      checks.push({ check: 'transpilePackages', status: 'skipped', note: 'Pass `nextConfig` to verify.' })
    }
  }

  // Peer coverage for imported components.
  const list = Array.isArray(imports) ? imports : [imports].filter(Boolean)
  if (list.length) {
    let installed = new Set()
    if (Array.isArray(installedDeps)) installed = new Set(installedDeps)
    else if (installedDeps && typeof installedDeps === 'object') installed = new Set(Object.keys(installedDeps))
    else if (typeof installedDeps === 'string') { try { const p = JSON.parse(installedDeps); installed = new Set([...Object.keys(p.dependencies || {}), ...Object.keys(p.devDependencies || {})]) } catch { installed = new Set(installedDeps.split(/[\s,]+/).filter(Boolean)) } }
    const knowInstalled = installed.size > 0
    for (const spec of list) {
      const c = d.manifest.components[resolveComponent(spec).name]
      const peers = peersOf(c)
      if (!peers.length) continue
      if (!knowInstalled) { checks.push({ check: `peers for ${spec}`, status: 'unknown', note: `Needs ${peers.join(', ')}. Pass installedDeps to confirm.` }); continue }
      const missing = peers.filter((p) => !installed.has(p))
      if (missing.length) fail(`peers for ${spec}`, `Install missing peer(s): ${missing.join(', ')}.`)
      else pass(`peers for ${spec}`)
    }
  }

  const fails = checks.filter((c) => c.status === 'FAIL')
  const header = fails.length ? `${fails.length} FAIL — fix before shipping:` : 'All provided checks pass.'
  return cap(banner(d.version) + '# verify_setup\n' + header + '\n```json\n' + JSON.stringify(checks, null, 1) + '\n```')
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

// ── check_slop ──────────────────────────────────────────────────────────────
// Deterministic design-quality gate. Runs the amalgamated corpus (slop-corpus.json)
// over the code an agent is about to emit; returns anti-patterns (findings), good
// practice detected (strengths), and the DO-side (guidance). No LLM, no version.
export async function checkSlop({ code }) {
  if (!code || !String(code).trim()) {
    return 'Pass `code` — the component source you are about to write. Returns anti-slop findings + strengths detected + design guidance.'
  }
  const src = String(code)
  const lines = src.split('\n')
  const allowed = (line, id) => {
    const m = line && line.match(/\/\/\s*slop-allow:\s*([\w-]+)/)
    return !!m && m[1] === id
  }
  const findings = []
  for (const rule of SLOP_CORPUS.rules) {
    if (rule.kind === 'count') {
      const re = new RegExp(rule.pattern)
      let hits = 0
      for (const l of lines) if (re.test(l)) hits++
      if (hits >= (rule.threshold ?? 2)) {
        findings.push({ id: rule.id, severity: rule.severity, category: rule.category, count: hits, message: rule.message, fix: rule.fix, source: rule.source })
      }
    } else if (rule.kind === 'presence-without') {
      if (new RegExp(rule.pattern).test(src) && !new RegExp(rule.missing).test(src)) {
        findings.push({ id: rule.id, severity: rule.severity, category: rule.category, message: rule.message, fix: rule.fix, source: rule.source })
      }
    } else {
      const re = new RegExp(rule.pattern)
      lines.forEach((line, i) => {
        const prev = i > 0 ? lines[i - 1] : ''
        if (re.test(line) && !allowed(line, rule.id) && !allowed(prev, rule.id)) {
          findings.push({ id: rule.id, severity: rule.severity, category: rule.category, line: i + 1, message: rule.message, fix: rule.fix, source: rule.source })
        }
      })
    }
  }
  // Structural (AST) findings — nested cards, button duo, identical grids, skipped
  // headings. Parse failures degrade gracefully (regex findings still returned).
  try {
    findings.push(...astFindings(src))
  } catch {
    /* non-JSX or parse error — skip structural pass */
  }
  const order = { P0: 0, P1: 1, P2: 2 }
  findings.sort((a, b) => (order[a.severity] - order[b.severity]) || ((a.line ?? 0) - (b.line ?? 0)))

  const strengths = []
  for (const s of SLOP_GUIDANCE.strengths) {
    const present = new RegExp(s.pattern).test(src)
    if ((s.kind === 'present' && present) || (s.kind === 'absent' && !present)) {
      strengths.push({ id: s.id, message: s.message })
    }
  }

  const blocking = findings.filter((f) => f.severity === 'P0' || f.severity === 'P1').length
  const out = {
    verdict: blocking ? 'fix-before-emit' : findings.length ? 'minor-nits' : 'clean',
    summary: { findings: findings.length, blocking, strengths: strengths.length },
    findings,
    strengths,
    guidance: SLOP_GUIDANCE.principles,
    principles_from_setu: SLOP_GUIDANCE.setuPrinciples,
    self_critique: SLOP_GUIDANCE.selfCritique,
    note: SLOP_GUIDANCE.ad,
    deferred_checks: SLOP_CORPUS.deferred,
  }
  let str = JSON.stringify(out, null, 2)
  if (str.length > MAX_CHARS) str = str.slice(0, MAX_CHARS) + '\n… [truncated]'
  return str
}

// ── how_to_use ──────────────────────────────────────────────────────────────
// Self-teaching bootstrap. An agent's recommended first call — returns the MCP's
// operating manual: tool map, the two sequences, version rule, escape hatch.
// ── Preset Library ────────────────────────────────────────────────────────
// Discovery/preview over the LIVE site registry (shadcn-compatible). Presets are
// copy-and-own, version-independent — no `version` param. Install stays
// shadcn-CLI-native (`shadcn add @devalok/<name>`); these tools are the layer
// the shadcn MCP can't provide: discovery, source preview, install guidance.

const REGISTRY_BASE = (process.env.REGISTRY_BASE_URL || 'https://shilp-sutra.devalok.in').replace(/\/$/, '')
const REGISTRY_TTL_MS = 5 * 60 * 1000
const registryCache = new Map()

async function fetchRegistry(path) {
  const hit = registryCache.get(path)
  if (hit && Date.now() - hit.at < REGISTRY_TTL_MS) return hit.data
  const res = await fetch(`${REGISTRY_BASE}${path}`, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`registry ${path} → ${res.status}`)
  const data = await res.json()
  registryCache.set(path, { at: Date.now(), data })
  return data
}

function presetBanner() {
  return (
    'shilp-sutra Preset Library — pre-assembled screens built FROM shilp-sutra ' +
    'components. You copy + own the source (version-independent). Install with the ' +
    'shadcn CLI: `npx shadcn@latest add @devalok/<name>`.\n\n'
  )
}

function registriesSnippet() {
  return `"registries": { "@devalok": "${REGISTRY_BASE}/r/{name}.json" }`
}

function normalizeName(name) {
  return String(name || '').replace(/^@devalok\//, '').replace(/\.json$/, '').trim()
}

export async function listPresets({ category, query } = {}) {
  let index
  try {
    index = await fetchRegistry('/r/registry.json')
  } catch (e) {
    return presetBanner() + `Could not reach the registry (${e.message}). Try again shortly.`
  }
  let items = index.items || []
  if (category) items = items.filter((i) => (i.categories || []).includes(category))
  if (query) {
    const q = query.toLowerCase()
    items = items.filter((i) =>
      `${i.name} ${i.title} ${i.description} ${(i.uses || []).join(' ')}`.toLowerCase().includes(q),
    )
  }
  const out = items.map((i) => {
    const installName = i.installName || `@devalok/${i.name}`
    return {
      name: i.name,
      installName,
      title: i.title,
      description: i.description,
      categories: i.categories,
      uses: i.uses,
      install: `npx shadcn@latest add ${installName}`,
      mcpPrompt: `add the ${installName} preset`,
    }
  })
  return cap(
    presetBanner() +
      `First time? register the namespace once in components.json → ${registriesSnippet()}\n\n` +
      JSON.stringify(out, null, 2),
  )
}

export async function getPreset({ name }) {
  const slug = normalizeName(name)
  let item
  try {
    item = await fetchRegistry(`/r/${slug}.json`)
  } catch {
    let names = ''
    try {
      const index = await fetchRegistry('/r/registry.json')
      names = (index.items || []).map((i) => i.name).join(', ')
    } catch {
      /* ignore */
    }
    return presetBanner() + `No preset "${slug}".` + (names ? ` Available: ${names}.` : '')
  }
  // Echo the item without inlined file content (use preview_preset for source).
  const lean = {
    ...item,
    files: (item.files || []).map(({ path, type, target }) => ({ path, type, target })),
  }
  const install = [
    '## Install',
    '1. Register the namespace once in components.json:',
    '```json',
    `{ ${registriesSnippet()} }`,
    '```',
    '2. Add the preset:',
    '```bash',
    `npx shadcn@latest add @devalok/${slug}`,
    '```',
    `Or tell your agent: "add the @devalok/${slug} preset".`,
    '',
    item.docs || '',
  ].join('\n')
  return cap(
    presetBanner() +
      install +
      '\n\n## registry-item (files listed; call preview_preset for source)\n```json\n' +
      JSON.stringify(lean, null, 2) +
      '\n```',
  )
}

export async function previewPreset({ name, file } = {}) {
  const slug = normalizeName(name)
  let item
  try {
    item = await fetchRegistry(`/r/${slug}.json`)
  } catch {
    return presetBanner() + `No preset "${slug}". Call list_presets to see available names.`
  }
  const files = item.files || []
  const chosen = file ? files.find((f) => f.path.endsWith(file) || f.target.endsWith(file)) : files[0]
  if (!chosen) {
    return presetBanner() + `No file "${file}" in "${slug}". Files: ${files.map((f) => f.path).join(', ')}.`
  }
  const header =
    `// ${item.title} — ${chosen.target}\n` +
    `// Primitives resolve from @devalok/shilp-sutra (installed by \`shadcn add\`). READ-ONLY preview.\n`
  return cap(
    presetBanner() +
      '```tsx\n' +
      header +
      chosen.content +
      '\n```\n\n' +
      (item.meta && item.meta.source ? `Source: ${item.meta.source}` : ''),
  )
}

export async function howToUse() {
  return JSON.stringify(
    {
      what: 'shilp-sutra MCP — version-exact docs + design-quality tools for @devalok/shilp-sutra. Prefer these tools over reading llms.txt / doc files into context (smaller, version-correct).',
      always: "Pass the consumer's installed version (from node_modules/@devalok/shilp-sutra/package.json) as `version` on the doc tools.",
      tools: {
        how_to_use: 'This manual. Call first if you are new to the MCP.',
        find_component: 'Search components by keyword; empty query lists all.',
        get_component: 'Version-exact props / variants / usage / composition / changelog for one component.',
        get_tokens: 'Design tokens (color, spacing, typography, radius, shadow, motion, z).',
        get_setup: 'Framework install recipe or guide.',
        upgrade: 'Breaking changes + migration between two versions.',
        search_docs: 'Full-text search across the docs.',
        detect_framework: 'Map package.json → the right setup recipe id.',
        preflight: 'Install the peer deps your imports need.',
        validate_snippet: 'Pre-write linter: TW4 dead classes, bad props, barrel/peer traps.',
        verify_setup: 'Post-setup gate: CSS order, transpilePackages, peer coverage.',
        check_slop: 'Pre-emit design-quality gate: anti-slop findings + strengths + DO-guidance.',
        list_presets: 'Discover Preset Library items (pre-assembled screens built from shilp-sutra). Version-independent.',
        get_preset: 'Full detail + install steps (components.json namespace + shadcn add) for one preset.',
        preview_preset: 'Read-only TSX source of a preset — show/adapt without installing.',
        report_issue: 'File a public GitHub issue (bug / docs gap / feature).',
        ...(buildathon.isOpen() ? { submit_entry: 'Submit a Build with Shilp Sutra buildathon entry (see `buildathon` below).' } : null),
      },
      sequences: {
        setting_up: ['detect_framework(package.json)', 'get_setup(recipe)', 'preflight(framework, imports)', 'validate_snippet(code) BEFORE writing each file', 'verify_setup(...) after'],
        writing_a_component: ['check_slop(code) BEFORE emitting — fix P0/P1, keep the strengths, pull unmet guidance into the design', 'validate_snippet(code) for TW4 / prop correctness', 'then write the file'],
        using_a_preset: ['list_presets(category?) to discover', 'get_preset(name) for install steps + registry-item', 'add the @devalok registry to components.json (once)', 'npx shadcn add @devalok/<name> — or tell the agent "add the @devalok/<name> preset"', 'preview_preset(name) to read/adapt the source without installing'],
      },
      escape_hatch: '`// slop-allow: <id> <reason>` on the offending line (or the line above) silences a check_slop finding — for deliberate, justified deviations.',
      buildathon: buildathon.howToUseNotice() ?? undefined,
      more: SLOP_GUIDANCE.ad,
    },
    null,
    2,
  )
}

// ── check_slop: structural (AST) pass ───────────────────────────────────────
// Parses JSX/TSX and detects tells that aren't a single string: cards nested in
// cards, the solid+outline button duo, identical card grids, skipped heading
// levels. Best-effort — errorRecovery keeps partial trees; caller try/catches.
const CARD_NAME = /Card$/
const BUTTON_NAMES = new Set(['Button', 'SplitButton', 'IconButton'])

function jsxName(node) {
  const n = node.openingElement && node.openingElement.name
  if (!n) return ''
  if (n.type === 'JSXIdentifier') return n.name
  if (n.type === 'JSXMemberExpression') return n.property && n.property.name ? n.property.name : ''
  return ''
}

function jsxAttr(node, attr) {
  const attrs = (node.openingElement && node.openingElement.attributes) || []
  const a = attrs.find((x) => x.type === 'JSXAttribute' && x.name && x.name.name === attr)
  if (!a || !a.value) return undefined
  if (a.value.type === 'StringLiteral') return a.value.value
  if (a.value.type === 'JSXExpressionContainer' && a.value.expression && a.value.expression.type === 'StringLiteral') {
    return a.value.expression.value
  }
  return undefined
}

function astFindings(src) {
  const ast = parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: true })
  const findings = []
  const headingLevels = []
  let nestedFlagged = false

  const jsxChildren = (node) => (node.children || []).filter((c) => c.type === 'JSXElement')

  function walk(node, inCard) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXElement') {
      const name = jsxName(node)
      if (CARD_NAME.test(name)) {
        if (inCard && !nestedFlagged) {
          nestedFlagged = true
          findings.push({ id: 'nested-cards', severity: 'P1', category: 'layout', via: 'ast', message: 'Card nested inside a Card — the deepest everything-a-card tell.', fix: 'Separate with spacing / type / dividers; a card inside a card is almost always wrong.', source: 'impeccable, Setu' })
        }
      }
      if (/^h[1-6]$/.test(name)) headingLevels.push(Number(name[1]))

      const kids = jsxChildren(node)
      const variants = kids.filter((k) => BUTTON_NAMES.has(jsxName(k))).map((k) => jsxAttr(k, 'variant'))
      if (variants.length >= 2) {
        const hasSolid = variants.some((v) => v === 'solid' || v === undefined) // solid is the default
        const hasOutline = variants.some((v) => v === 'outline' || v === 'ghost')
        if (hasSolid && hasOutline) {
          findings.push({ id: 'filled-outline-duo', severity: 'P1', category: 'component', via: 'ast', message: 'Solid + outline/ghost button pair — the default action-row preset.', fix: 'One clear primary; make the secondary `soft`, not outline. Avoid the fill-vs-outline couplet.', source: 'Setu, impeccable' })
        }
      }
      const cardCounts = {}
      for (const k of kids) {
        const kn = jsxName(k)
        if (CARD_NAME.test(kn)) cardCounts[kn] = (cardCounts[kn] || 0) + 1
      }
      if (Object.values(cardCounts).some((n) => n >= 3)) {
        findings.push({ id: 'identical-card-grid', severity: 'P2', category: 'layout', via: 'ast', message: '3+ identical sibling cards — the icon-title-blurb grid tell.', fix: 'Vary block size by importance; separate with space + type, not a symmetric card row.', source: 'impeccable, Setu' })
      }

      const nowInCard = inCard || CARD_NAME.test(name)
      for (const c of node.children || []) walk(c, nowInCard)
      return
    }
    for (const key of Object.keys(node)) {
      const v = node[key]
      if (Array.isArray(v)) {
        for (const x of v) if (x && typeof x === 'object' && x.type) walk(x, inCard)
      } else if (v && typeof v === 'object' && v.type) {
        walk(v, inCard)
      }
    }
  }
  walk(ast.program, false)

  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      findings.push({ id: 'skipped-heading-level', severity: 'P1', category: 'a11y', via: 'ast', message: `Heading jumps h${headingLevels[i - 1]} → h${headingLevels[i]} — skips a level.`, fix: 'Use sequential heading levels; style with classes, not by picking a smaller tag.', source: 'axe a11y' })
      break
    }
  }

  const seen = new Set()
  return findings.filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true)))
}
