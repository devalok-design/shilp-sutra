#!/usr/bin/env node
/**
 * typecheck-doc-snippets.mjs
 *
 * Type-check the code examples in docs/recipes/ and make-kit/ against the
 * package's own shipped types.
 *
 * Why this exists (#177). Recipes contained
 * `const { mode, toggle } = useColorMode()` when the hook actually returns
 * `{ colorMode, setColorMode, toggleColorMode }`, and `<Icon size={16} />`
 * where `size` is a tier union, not a number. Seven files had drifted before
 * anyone noticed. `lint-doc-examples.mjs` catches dead Tailwind classes and
 * removed enum values, but nothing checked a snippet against the actual `.d.ts`.
 *
 * That matters more here than in a normal docs setup: the MCP and the agent
 * skill both tell AI agents to trust these docs over their training data, so a
 * type-wrong snippet is not a typo a human skims past — it is the authoritative
 * source an agent pastes verbatim during someone's first hour with the package.
 *
 *   node scripts/typecheck-doc-snippets.mjs           # report
 *   node scripts/typecheck-doc-snippets.mjs --check   # exit 1 on any error
 *
 * WHAT IT CHECKS, and what it deliberately does not.
 *
 * Only blocks that import from `@devalok/shilp-sutra` are checked — those are
 * the ones making a claim about our API and therefore the ones that can drift.
 * Of 200 ts/tsx blocks, 131 are illustrative fragments referencing placeholder
 * components (`<DeveloperConsole />`), and type-checking those would bury a real
 * finding under hundreds of "cannot find name" errors. The dead-class and
 * enum-value checks in lint-doc-examples.mjs already cover those blocks.
 *
 * OPTING OUT. Some snippets are deliberately wrong — the "❌ don't do this"
 * examples. Put an HTML comment on the line before the fence:
 *
 *     <!-- typecheck-skip: shows the RSC error this recipe is about -->
 *
 * The reason is required, and it is printed in the report so a skip cannot
 * quietly accumulate.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { globSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const REPO = resolve(ROOT, '../..')
const OUT = join(ROOT, '.doc-typecheck')
const check = process.argv.includes('--check')

const GREEN = '\x1b[32m', RED = '\x1b[31m', YELLOW = '\x1b[33m', DIM = '\x1b[90m', BOLD = '\x1b[1m', RESET = '\x1b[0m'

// Fence, plus whatever line preceded it (for the skip marker).
const FENCE = /(^|\n)([^\n]*)\r?\n```(tsx|ts|jsx)\r?\n([\s\S]*?)```/g
const PKG = '@devalok/shilp-sutra'

const blocks = []
const skipped = []

const files = [
  ...globSync('docs/recipes/*.md', { cwd: ROOT }),
  ...globSync('make-kit/**/*.md', { cwd: ROOT }),
].sort()

for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), 'utf8')
  let n = 0
  for (const m of src.matchAll(FENCE)) {
    const [, , prevLine, , code] = m
    n++

    const skip = prevLine.match(/<!--\s*typecheck-skip:\s*(.+?)\s*-->/)
    if (skip) { skipped.push({ file: rel, n, reason: skip[1] }); continue }

    // Only blocks that reference our own API can drift against our own types.
    if (!code.includes(PKG)) continue

    // A snippet with an explicit elision is not meant to compile.
    if (/^\s*\/\/\s*\.\.\.|…|\/\*\s*\.\.\.\s*\*\//m.test(code)) {
      skipped.push({ file: rel, n, reason: 'contains an explicit elision (… or // ...)' })
      continue
    }

    blocks.push({ file: rel, n, code })
  }
}

console.log(`${BOLD}Doc snippet typecheck${RESET}`)
console.log(`  ${files.length} files · ${blocks.length} blocks import ${PKG} · ${skipped.length} skipped\n`)

if (blocks.length === 0) {
  console.log(`${YELLOW}No checkable blocks found — that is suspicious, not a pass.${RESET}`)
  process.exit(check ? 1 : 0)
}

const rel = (p) => relative(OUT, join(ROOT, p)).replace(/\\/g, '/')

// Without dist there is nothing to check against, and silently falling back to
// src would make this gate quietly weaker rather than loudly absent.
if (!existsSync(join(ROOT, 'dist/ui/index.d.ts'))) {
  console.error(`${RED}No dist/ui/index.d.ts — run the build first.${RESET}`)
  console.error(`${DIM}This gate checks snippets against the SHIPPED types, so they have to exist.${RESET}`)
  process.exit(1)
}

// ── assemble a throwaway project ─────────────────────────────────────
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

/**
 * Recipes routinely show imports followed by SIBLING JSX elements — "put these
 * three things in your body" — which is good documentation and not a valid
 * module. Wrap that shape in a fragment so it compiles as written, rather than
 * forcing every doc to invent a wrapper element it does not want to show.
 *
 * Only the JSX shape is wrapped. A block whose body is statements is left
 * verbatim, because wrapping those in a `return` would break them.
 *
 * `offset` records how many lines the wrapper added, so reported line numbers
 * still point at the markdown the author wrote.
 */
function harness(code) {
  const lines = code.split('\n')
  let lastImport = -1
  let depth = 0
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (/^import\b/.test(t) || depth > 0) {
      lastImport = i
      depth += (t.match(/\{/g) || []).length - (t.match(/\}/g) || []).length
      if (depth < 0) depth = 0
    }
  }
  const head = lines.slice(0, lastImport + 1)
  const body = lines.slice(lastImport + 1)
  // Leading `// where this goes` comments must be hoisted ABOVE the JSX, not
  // wrapped inside it — inside a fragment `//` is text, not a comment, and a
  // line like `// inside <body>` gets parsed as an unclosed <body> tag.
  let lead = 0
  while (lead < body.length && (body[lead].trim() === '' || body[lead].trim().startsWith('//'))) lead++
  const comments = body.slice(0, lead)
  const jsx = body.slice(lead)

  const meat = jsx.join('\n').trim()
  if (!meat.startsWith('<') && !meat.startsWith('{/*')) return { text: code, offset: 0 }

  const out = [...head, ...comments, 'export function __DocSnippet() {', '  return (<>', ...jsx, '  </>)', '}']
  // lines added strictly above the first JSX line
  return { text: out.join('\n'), offset: 2 }
}

const manifest = []
blocks.forEach((b, i) => {
  const name = `snippet-${String(i).padStart(3, '0')}.tsx`
  const { text, offset } = harness(b.code)
  manifest.push({ ...b, name, offset })
  writeFileSync(join(OUT, name), text.endsWith('\n') ? text : text + '\n')
})

/**
 * Recipes legitimately import framework packages we do not depend on — `next`,
 * `next-themes`, `@remix-run/react`, a stylesheet. Those failing to resolve is
 * noise: the point of this gate is whether the snippet uses OUR API correctly.
 *
 * So every non-`@devalok` specifier gets a shorthand ambient declaration, which
 * types its exports as `any`. Our own package is deliberately NOT stubbed — it
 * resolves to real source, so a wrong hook shape or prop type still fails.
 */
// A bare `declare module 'x';` is not enough: it makes VALUE imports `any`, but
// `import type { NextConfig } from 'next'` then resolves to a namespace, which
// cannot be used as a type (TS2709). So each foreign module gets a real body
// declaring every name the snippets actually import from it, as both a value
// and a type alias.
const foreign = new Map() // specifier -> { names:Set, defaults:boolean }
const IMPORT = /import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g
for (const b of blocks) {
  for (const m of b.code.matchAll(IMPORT)) {
    const spec = m[3] || m[4]
    if (!spec || spec.startsWith(PKG)) continue
    if (!foreign.has(spec)) foreign.set(spec, { names: new Set(), def: false })
    const entry = foreign.get(spec)
    const clause = m[2] || ''
    // default import: `import X from` or `import X, { … } from`
    const dflt = clause.match(/^\s*([A-Za-z_$][\w$]*)\s*(,|$)/)
    if (dflt) { entry.def = true; entry.names.add(dflt[1]) }
    const braces = clause.match(/\{([\s\S]*?)\}/)
    if (braces) {
      for (const raw of braces[1].split(',')) {
        const n = raw.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0].trim()
        if (n) entry.names.add(n)
      }
    }
  }
}

const ambient = [
  '// Auto-generated. Framework packages a recipe may legitimately import but we',
  '// do not depend on. Every name is `any`, so ONLY our own API is really checked.',
  "declare module '*.css';",
  "declare module '*.scss';",
]
for (const [spec, { names, def }] of [...foreign].sort((a, b) => a[0].localeCompare(b[0]))) {
  ambient.push(`declare module '${spec}' {`)
  for (const n of [...names].sort()) {
    // both, so the name works whether the snippet used it as a value or a type
    ambient.push(`  export const ${n}: any`)
    ambient.push(`  export type ${n} = any`)
  }
  if (def) ambient.push('  const _default: any')
  if (def) ambient.push('  export default _default')
  ambient.push('}')
}
writeFileSync(join(OUT, 'ambient.d.ts'), ambient.join('\n') + '\n')

writeFileSync(join(OUT, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    jsx: 'react-jsx',
    module: 'ESNext',
    moduleResolution: 'bundler',
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    // Snippets legitimately declare things they do not use, and a recipe often
    // shows a prop without wiring a handler. Those are not API drift.
    noUnusedLocals: false,
    noUnusedParameters: false,
    allowJs: false,
    esModuleInterop: true,
    // no baseUrl — deprecated in TS 6, and `paths` resolves relative to this
    // tsconfig without it
    // Resolve against the BUILT .d.ts, not src. That is literally what a
    // consumer receives, and pointing at src drags our entire source into the
    // program — slow, and source-level errors surface as if a doc caused them.
    paths: {
      '@devalok/shilp-sutra': [rel('dist/ui/index.d.ts')],
      '@devalok/shilp-sutra/*': [rel('dist') + '/*'],
    },
  },
  include: ['*.tsx', 'ambient.d.ts'],
}, null, 2))

// ── run tsc ──────────────────────────────────────────────────────────
let raw = ''
let failed = false
try {
  execFileSync(
    process.execPath,
    [join(REPO, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', 'tsconfig.json'],
    { cwd: OUT, encoding: 'utf-8', stdio: 'pipe' },
  )
} catch (e) {
  failed = true
  raw = (e.stdout || '') + (e.stderr || '')
}

/**
 * A doc snippet is a fragment, and fragments produce errors that say nothing
 * about our API: a placeholder component the reader is meant to supply, a
 * "wrong vs right" block that imports the same name twice on purpose, an
 * untyped parameter in illustrative JS.
 *
 * Ignoring those by ERROR CLASS rather than by marking each block keeps the
 * signal high without making every future doc example carry a skip marker.
 * Anything not listed here still fails — including TS2724 (no exported member),
 * TS2339 (no such property), TS2322 (wrong type), TS2554 (wrong arity) and
 * TS2741 (missing prop), which are exactly the drift this gate exists for.
 */
const FRAGMENT_NOISE = new Set([
  'TS2304', // Cannot find name — the reader's own component
  'TS2300', // Duplicate identifier — a deliberate wrong-vs-right contrast
  'TS7031', // implicitly any (destructured) — untyped illustrative JS
  'TS7006', // implicitly any (parameter)
  'TS2657', // JSX must have one parent — loose sibling elements
  'TS17014', // JSX fragment has no closing tag
  'TS6133', // declared but never read
])
const isNoise = (msg) => {
  const code = msg.match(/error (TS\d+):/)?.[1]
  if (!code) return false
  // A missing module IS a real finding when it is one of ours — a recipe
  // pointing at a subpath we do not ship is exactly the drift we want.
  if (code === 'TS2307') return !msg.includes(PKG)
  return FRAGMENT_NOISE.has(code)
}

// ── map errors back to the markdown that produced them ───────────────
const byFile = new Map()
for (const line of raw.split('\n')) {
  // trim the \r — tsc emits CRLF here and a `$`-anchored match silently fails
  const m = line.replace(/\r$/, '').match(/^(snippet-\d+)\.tsx\((\d+),(\d+)\):\s*(error TS\d+:.*)$/)
  if (!m) continue
  const entry = manifest.find((x) => x.name === `${m[1]}.tsx`)
  if (!entry) continue
  if (isNoise(m[4])) continue
  const key = `${entry.file}#${entry.n}`
  if (!byFile.has(key)) byFile.set(key, { entry, errors: [] })
  // subtract the wrapper so the line points at what the author actually wrote
  byFile.get(key).errors.push({ line: Number(m[2]) - (entry.offset || 0), col: Number(m[3]), msg: m[4] })
}

if (skipped.length) {
  console.log(`${DIM}Skipped:${RESET}`)
  for (const s of skipped) console.log(`${DIM}  ${s.file} block ${s.n} — ${s.reason}${RESET}`)
  console.log()
}

if (byFile.size === 0) {
  // tsc exiting non-zero is expected here: fragments always produce noise-class
  // errors. It is only a problem if something failed that we could NOT account
  // for — a project-level error, or a snippet error we did not classify.
  const unaccounted = raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => /error TS\d+:/.test(l))
    .filter((l) => !isNoise(l))
  if (unaccounted.length) {
    console.error(`${RED}tsc reported errors that map to no snippet:${RESET}`)
    for (const l of unaccounted.slice(0, 20)) console.error(`  ${l}`)
    process.exit(1)
  }
  console.log(`${GREEN}${BOLD}✓ all ${blocks.length} snippets typecheck against the shipped API${RESET}`)
  rmSync(OUT, { recursive: true, force: true })
  process.exit(0)
}

console.error(`${RED}${BOLD}✗ ${byFile.size} snippet(s) do not compile against the shipped types${RESET}\n`)
for (const { entry, errors } of byFile.values()) {
  console.error(`${YELLOW}${entry.file}${RESET} — code block ${entry.n}`)
  const lines = entry.code.split('\n')
  for (const e of errors) {
    console.error(`  ${e.msg}`)
    const src = lines[e.line - 1]
    if (src !== undefined) console.error(`${DIM}    ${e.line} | ${src.trim()}${RESET}`)
  }
  console.error()
}
console.error(`${DIM}Snippets are written to ${relative(REPO, OUT)} for inspection.`)
console.error(`If a block is deliberately wrong, mark it with an HTML comment on the line above the fence:`)
console.error(`  <!-- typecheck-skip: why -->${RESET}`)
process.exit(check ? 1 : 0)
