/**
 * Docs registry — reads markdown source from packages/core/docs/recipes/
 * at build/request time. Single source of truth shared with the npm tarball.
 */
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const RECIPES_DIR = join(REPO_ROOT, 'packages', 'core', 'docs', 'recipes')

export type DocPage = {
  slug: string
  title: string
  category: 'install' | 'customize' | 'reference' | 'troubleshoot'
  source: string
}

const DOC_META: Record<string, Omit<DocPage, 'slug' | 'source'>> = {
  'install-next-app-router': { title: 'Next.js (App Router)', category: 'install' },
  'install-next-pages': { title: 'Next.js (Pages Router)', category: 'install' },
  'install-vite': { title: 'Vite + React', category: 'install' },
  'install-astro': { title: 'Astro', category: 'install' },
  'install-remix': { title: 'Remix', category: 'install' },
  'install-tanstack-start': { title: 'TanStack Start', category: 'install' },
  'customize-brand': { title: 'Customize brand', category: 'customize' },
  'server-components': { title: 'Server Components', category: 'reference' },
  troubleshoot: { title: 'Troubleshoot', category: 'troubleshoot' },
}

const CATEGORY_LABELS: Record<DocPage['category'], string> = {
  install: 'Install',
  customize: 'Customize',
  reference: 'Reference',
  troubleshoot: 'Troubleshoot',
}

const SLUG_ORDER = Object.keys(DOC_META)

export function getCategoryLabel(c: DocPage['category']): string {
  return CATEGORY_LABELS[c]
}

export async function getDoc(slug: string): Promise<DocPage | null> {
  const meta = DOC_META[slug]
  if (!meta) return null
  try {
    const source = await fs.readFile(join(RECIPES_DIR, `${slug}.md`), 'utf8')
    return { slug, title: meta.title, category: meta.category, source }
  } catch {
    return null
  }
}

export function getAllDocSlugs(): string[] {
  return [...SLUG_ORDER]
}

export function getDocMeta(slug: string): Omit<DocPage, 'slug' | 'source'> | null {
  return DOC_META[slug] ?? null
}

export function groupedDocs() {
  const groups: Record<DocPage['category'], string[]> = {
    install: [],
    customize: [],
    reference: [],
    troubleshoot: [],
  }
  for (const slug of SLUG_ORDER) {
    const meta = DOC_META[slug]
    if (meta) groups[meta.category].push(slug)
  }
  return groups
}
