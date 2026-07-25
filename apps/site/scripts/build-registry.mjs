/**
 * build-registry.mjs — emits the shadcn-compatible registry as STATIC files
 * under apps/site/public/r/ at prebuild:
 *   public/r/registry.json   → the index (with installName + uses for discovery)
 *   public/r/<slug>.json     → one registry-item (what `shadcn add @devalok/<slug>` fetches)
 *
 * Static files (not a runtime-fs route) so the registry survives Next standalone
 * packaging — the earlier route read content/presets/*.tsx via fs at runtime,
 * which isn't traced into the standalone bundle and served EMPTY presets.
 *
 * Hybrid model (validated with a real `shadcn add`): preset files import
 * primitives from the npm package @devalok/shilp-sutra, so registryDependencies
 * is empty and those imports pass through shadcn's @/-scoped rewrite untouched.
 *
 * Dependency PIN (see pinFor):
 *  - 0.x (beta): BARE specifier (no version). A caret is wrong here — `^0.53.0`
 *    EXCLUDES 0.54.0 on 0.x, so it would fight a consumer upgrading to the version
 *    that ships the preset; and the site deploys from `main`, which can lead npm,
 *    so a version pin can demand an unpublished version → `shadcn add` hard-fails.
 *    Bare installs latest / keeps the consumer's existing copy — always resolvable.
 *  - >=1.x (stable): `^{major}.0.0` — patches + minors flow, breaking major held.
 */
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = join(HERE, '..')
const REPO_ROOT = join(SITE, '..', '..')
const PRESETS_DIR = join(SITE, 'content', 'presets')
const OUT_DIR = join(SITE, 'public', 'r')

const REGISTRY_HOMEPAGE = 'https://shilp-sutra.devalok.in/presets'
const AUTHOR = 'Devalok Design Studio <design@devalok.in>'
const GITHUB_BLOB =
  'https://github.com/devalok-design/shilp-sutra/blob/main/apps/site/content/presets'
const PROVIDED = new Set(['react', 'react-dom'])

const DOCS_NOTE =
  'Requires @devalok/shilp-sutra installed AND its CSS imported: ' +
  '`@import "tailwindcss";` then `@import "@devalok/shilp-sutra/css";`. ' +
  'framer-motion ^12 is a required peer. If it renders unstyled, your CSS is not wired — ' +
  'run the shilp-sutra MCP get_setup(framework) recipe.'

async function coreVersion() {
  const pkg = JSON.parse(await fs.readFile(join(REPO_ROOT, 'packages', 'core', 'package.json'), 'utf8'))
  return pkg.version
}

/**
 * The version constraint to attach to @devalok/shilp-sutra in a preset's deps.
 * Returns '' (bare, no constraint) on 0.x — see the file header for why a caret
 * is broken there. On >=1.x, caret-major.
 */
function pinFor(version) {
  const [maj] = version.split('.')
  if (maj === '0') return '' // beta: bare specifier — always resolvable
  return `^${maj}.0.0`
}

function packageOf(spec) {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

function analyzeImports(source, label) {
  const deps = new Set()
  let core = false
  for (const m of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    const spec = m[1]
    if (spec.startsWith('.')) continue
    if (spec.startsWith('@/')) {
      throw new Error(
        `[build-registry] ${label} imports a site alias "${spec}". Presets must be self-contained — ` +
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

async function main() {
  const version = await coreVersion()
  const entries = await fs.readdir(PRESETS_DIR, { withFileTypes: true })
  const slugs = []
  for (const e of entries) {
    if (!e.isDirectory()) continue
    try {
      await fs.access(join(PRESETS_DIR, e.name, 'preset.tsx'))
      slugs.push(e.name)
    } catch {
      /* no preset.tsx */
    }
  }
  slugs.sort()

  await fs.mkdir(OUT_DIR, { recursive: true })

  const indexItems = []
  for (const slug of slugs) {
    const dir = join(PRESETS_DIR, slug)
    const meta = JSON.parse(await fs.readFile(join(dir, 'meta.json'), 'utf8'))
    const content = await fs.readFile(join(dir, 'preset.tsx'), 'utf8')
    const { deps, core } = analyzeImports(content, `${slug}/preset.tsx`)

    const dependencies = []
    if (core) {
      const pin = pinFor(version)
      dependencies.push(pin ? `@devalok/shilp-sutra@${pin}` : '@devalok/shilp-sutra')
    }
    dependencies.push(...[...deps].sort())

    const item = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: slug,
      type: 'registry:block',
      title: meta.title,
      description: meta.description,
      author: AUTHOR,
      categories: meta.categories,
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
        shilpSutraVersion: version,
        uses: meta.uses,
        ...(meta.brandNotes ? { brandNotes: meta.brandNotes } : {}),
        source: `${GITHUB_BLOB}/${slug}/preset.tsx`,
      },
    }

    await fs.writeFile(join(OUT_DIR, `${slug}.json`), JSON.stringify(item, null, 2) + '\n')

    indexItems.push({
      name: slug,
      type: 'registry:block',
      title: meta.title,
      description: meta.description,
      categories: meta.categories,
      installName: `@devalok/${slug}`,
      uses: meta.uses,
    })
  }

  const index = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: '@devalok',
    homepage: REGISTRY_HOMEPAGE,
    items: indexItems,
  }
  await fs.writeFile(join(OUT_DIR, 'registry.json'), JSON.stringify(index, null, 2) + '\n')

  console.log(`build-registry: wrote ${slugs.length} item(s) + registry.json -> public/r/ (v${version})`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
