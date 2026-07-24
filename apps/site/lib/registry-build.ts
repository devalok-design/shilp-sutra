/**
 * Registry build — derives shadcn-compatible registry-item JSON from the preset
 * source at BUILD time (the /r/* routes are force-static). No separate generator
 * artifact: the preset files ARE the source of truth, so the registry can't drift.
 *
 * Hybrid model (validated 2026-07-25 with a real `shadcn add`): preset files
 * import primitives from the published npm package `@devalok/shilp-sutra`, so
 * `registryDependencies` is empty and those imports pass through shadcn's
 * `@/`-scoped rewrite untouched. `@devalok/shilp-sutra` is pinned caret-to-minor
 * so consumers get fixes but not a breaking major under frozen wiring.
 */
import { getAllPresets, getPreset, getPresetSource } from '@/lib/presets-registry'
import { SHILP_SUTRA_VERSION } from '@/lib/version'

const REGISTRY_HOMEPAGE = 'https://shilp-sutra.devalok.in/presets'
const AUTHOR = 'Devalok Design Studio <design@devalok.in>'
const GITHUB_BLOB =
  'https://github.com/devalok-design/shilp-sutra/blob/main/apps/site/content/presets'

/** Peers the consumer already provides — never list as a dependency. */
const PROVIDED = new Set(['react', 'react-dom'])

export type RegistryItem = {
  $schema: string
  name: string
  type: 'registry:block'
  title: string
  description: string
  author: string
  categories: string[]
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; type: 'registry:component'; target: string; content: string }[]
  docs: string
  meta: Record<string, unknown>
}

/** caret-to-minor pin, e.g. 0.54.2 → ^0.54.0. */
function caretMinor(version: string): string {
  const [maj, min] = version.split('.')
  return `^${maj}.${min}.0`
}

/** npm package name from an import specifier. `@devalok/shilp-sutra/ui/x` → `@devalok/shilp-sutra`. */
function packageOf(spec: string): string {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

/**
 * Derive npm dependencies from the literal imports in a preset file, and HARD-FAIL
 * on any `@/` site-alias import (shadcn would rewrite it to the consumer's
 * nonexistent alias → broken install). The self-containment contract.
 */
function analyzeImports(source: string, fileLabel: string): { deps: Set<string>; core: boolean } {
  const deps = new Set<string>()
  let core = false
  const re = /\bfrom\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const spec = match[1]
    if (spec.startsWith('.')) continue // relative sibling — shipped alongside
    if (spec.startsWith('@/')) {
      throw new Error(
        `[registry] ${fileLabel} imports a site alias "${spec}". Presets must be self-contained — ` +
          `import only from @devalok/shilp-sutra/*, third-party npm, or a relative sibling.`,
      )
    }
    const pkg = packageOf(spec)
    if (PROVIDED.has(pkg)) continue
    if (pkg === '@devalok/shilp-sutra') core = true
    else deps.add(pkg)
  }
  return { deps, core }
}

const DOCS_NOTE =
  'Requires @devalok/shilp-sutra installed AND its CSS imported: ' +
  '`@import "tailwindcss";` then `@import "@devalok/shilp-sutra/css";`. ' +
  'framer-motion ^12 is a required peer. If it renders unstyled, your CSS is not wired — ' +
  'run the shilp-sutra MCP get_setup(framework) recipe.'

export async function listPresetSlugs(): Promise<string[]> {
  return getAllPresets()
    .map((p) => p.slug)
    .sort()
}

/** Build the full registry-item JSON for one preset. Returns null for unknown slug. */
export async function buildRegistryItem(slug: string): Promise<RegistryItem | null> {
  const preset = getPreset(slug)
  if (!preset) return null

  const content = (await getPresetSource(slug)) ?? ''
  const { deps, core } = analyzeImports(content, `${slug}/preset.tsx`)

  const dependencies: string[] = []
  if (core) dependencies.push(`@devalok/shilp-sutra@${caretMinor(SHILP_SUTRA_VERSION)}`)
  dependencies.push(...[...deps].sort())

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: preset.slug,
    type: 'registry:block',
    title: preset.title,
    description: preset.description,
    author: AUTHOR,
    categories: preset.categories,
    dependencies,
    registryDependencies: [],
    files: [
      {
        path: `content/presets/${slug}/preset.tsx`,
        type: 'registry:component',
        target: `components/devalok/${slug}/${slug}.tsx`,
        content,
      },
    ],
    docs: DOCS_NOTE,
    meta: {
      shilpSutraVersion: SHILP_SUTRA_VERSION,
      uses: preset.uses,
      ...(preset.brandNotes ? { brandNotes: preset.brandNotes } : {}),
      source: `${GITHUB_BLOB}/${slug}/preset.tsx`,
    },
  }
}

/** Build the registry index (no inlined file content, per shadcn convention). */
export async function buildRegistryIndex() {
  const presets = getAllPresets()
  const items = presets.map((p) => ({
    name: p.slug,
    type: 'registry:block' as const,
    title: p.title,
    description: p.description,
    categories: p.categories,
    // Non-standard extras for discovery surfaces (our MCP, the /presets page).
    // The shadcn CLI resolves items by their own URL, not the index, so extra
    // fields here are harmless to it.
    installName: p.installName,
    uses: p.uses,
  }))
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: '@devalok',
    homepage: REGISTRY_HOMEPAGE,
    items,
  }
}
