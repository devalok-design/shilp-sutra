/**
 * Component registry — parsed from the canonical per-component docs at
 * `packages/core/docs/components/{ui,composed,shell}/*.md` at build time.
 *
 * Each markdown file has a known structure: H1 title, then a bullet list with
 * `Import:`, `Server-safe:`, `Category:`, then `## Props`, `## Defaults`,
 * `## Example`, etc. We parse the bullets + the Props section to extract
 * variant axes for the index card.
 */
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const DOCS_DIR = join(REPO_ROOT, 'packages', 'core', 'docs', 'components')

const LAYERS = ['ui', 'composed', 'shell'] as const
export type Layer = (typeof LAYERS)[number]

export type ComponentMeta = {
  slug: string
  name: string
  layer: Layer
  importPath: string
  serverSafe: boolean
  variants: string[]
  storybookUrl: string
  storybookSlug: string
}

const STORYBOOK_BASE = 'https://devalok-design.github.io/shilp-sutra'

function toStorybookSlug(layer: Layer, slug: string) {
  return `${layer}-${slug}--docs`
}

function parse(layer: Layer, slug: string, raw: string): ComponentMeta {
  const titleMatch = raw.match(/^#\s+(.+)$/m)
  const name = titleMatch ? titleMatch[1].trim() : slug

  const importMatch = raw.match(/^[-*]\s+Import:\s*(.+)$/m)
  const importPath = importMatch ? importMatch[1].trim() : `@devalok/shilp-sutra/${layer}`

  const safeMatch = raw.match(/^[-*]\s+Server-safe:\s*(Yes|No)/im)
  const serverSafe = safeMatch?.[1].toLowerCase() === 'yes'

  const propsBlock = raw.split(/\n##\s+/)[0] + (raw.match(/\n##\s+Props[\s\S]*?(?=\n##\s|$)/)?.[0] ?? '')
  const variants: string[] = []
  for (const axis of ['variant', 'size', 'color', 'shape', 'orientation', 'weight']) {
    const re = new RegExp(`^\\s+${axis}:\\s*("[^"]+"(?:\\s*\\|\\s*"[^"]+")*)`, 'm')
    const m = propsBlock.match(re)
    if (m) variants.push(axis)
  }

  return {
    slug,
    name,
    layer,
    importPath,
    serverSafe,
    variants,
    storybookSlug: toStorybookSlug(layer, slug),
    storybookUrl: `${STORYBOOK_BASE}/?path=/docs/${toStorybookSlug(layer, slug)}`,
  }
}

let cache: ComponentMeta[] | null = null

export async function getRegistry(): Promise<ComponentMeta[]> {
  if (cache) return cache

  const all: ComponentMeta[] = []
  for (const layer of LAYERS) {
    const dir = join(DOCS_DIR, layer)
    let entries: string[] = []
    try {
      entries = await fs.readdir(dir)
    } catch {
      continue
    }
    for (const file of entries) {
      if (!file.endsWith('.md')) continue
      if (file.startsWith('_')) continue
      const slug = file.replace(/\.md$/, '')
      const raw = await fs.readFile(join(dir, file), 'utf8')
      all.push(parse(layer, slug, raw))
    }
  }

  all.sort((a, b) => a.name.localeCompare(b.name))
  cache = all
  return all
}

export function groupByLayer(items: ComponentMeta[]): Record<Layer, ComponentMeta[]> {
  const out: Record<Layer, ComponentMeta[]> = { ui: [], composed: [], shell: [] }
  for (const item of items) out[item.layer].push(item)
  return out
}

/**
 * Full markdown source for a component slug. Used by the detail page to render
 * props tables, defaults, example code, composability notes, and gotchas
 * without re-parsing.
 */
export async function getComponentDocRaw(layer: Layer, slug: string): Promise<string | null> {
  try {
    return await fs.readFile(join(DOCS_DIR, layer, `${slug}.md`), 'utf8')
  } catch {
    return null
  }
}

/**
 * Finds the layer that owns a given slug. Returns null if no doc exists.
 */
export async function findLayerForSlug(slug: string): Promise<Layer | null> {
  for (const layer of LAYERS) {
    const path = join(DOCS_DIR, layer, `${slug}.md`)
    try {
      await fs.access(path)
      return layer
    } catch {
      continue
    }
  }
  return null
}

/**
 * Extracts the first fenced code block under the `## Example` heading.
 * Used by the Preview/Code tabs on the component detail page so the
 * "Code" tab shows the exact example committed in docs/components/.
 */
export function extractExampleCode(raw: string): string | null {
  const exampleSection = raw.match(/##\s+Example[\s\S]*?(?=\n##\s|$)/)
  if (!exampleSection) return null
  const fence = exampleSection[0].match(/```(?:\w+)?\n([\s\S]*?)\n```/)
  return fence?.[1].trim() ?? null
}
