/**
 * Presets registry — slug -> metadata, component, and source loader.
 *
 * Presets live at apps/site/content/presets/<slug>/ with:
 *   - preset.tsx  → the self-contained, distributable composition (the file a
 *                   consumer copies/installs; imports ONLY from
 *                   @devalok/shilp-sutra/*, third-party npm, or relative siblings —
 *                   NEVER a site `@/` alias, which `shadcn add` would rewrite).
 *   - meta.ts     → { slug, component, title, description, categories, uses, brandNotes }
 *
 * Unlike `blocks-registry` (marketing demos that may use site aliases), presets
 * are the ownable source distributed via the shadcn-compatible registry
 * (apps/site/app/r/[name]) and surfaced on /presets.
 */
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import type { ComponentType } from 'react'

import { SidebarApp } from '@/content/presets/sidebar-app/preset'
import { meta as sidebarAppMeta } from '@/content/presets/sidebar-app/meta'
import { SidebarProjects } from '@/content/presets/sidebar-projects/preset'
import { meta as sidebarProjectsMeta } from '@/content/presets/sidebar-projects/meta'
import { SidebarClient } from '@/content/presets/sidebar-client/preset'
import { meta as sidebarClientMeta } from '@/content/presets/sidebar-client/meta'
import { SidebarMinimal } from '@/content/presets/sidebar-minimal/preset'
import { meta as sidebarMinimalMeta } from '@/content/presets/sidebar-minimal/meta'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const PRESETS_DIR = join(REPO_ROOT, 'apps', 'site', 'content', 'presets')

/** npm namespace consumers add to components.json → `shadcn add @devalok/<slug>`. */
export const REGISTRY_NAMESPACE = '@devalok'

export type PresetMeta = {
  slug: string
  /** Exported component name in preset.tsx (what the consumer imports). */
  component: string
  title: string
  description: string
  categories: string[]
  /** shilp-sutra components used. Surfaces below the preview. */
  uses: string[]
  brandNotes?: string
}

export type Preset = PresetMeta & {
  Component: ComponentType
  /** e.g. "@devalok/sidebar-app" — the `shadcn add` target. */
  installName: string
}

const RAW: { meta: PresetMeta; Component: ComponentType }[] = [
  { meta: sidebarAppMeta, Component: SidebarApp },
  { meta: sidebarProjectsMeta, Component: SidebarProjects },
  { meta: sidebarClientMeta, Component: SidebarClient },
  { meta: sidebarMinimalMeta, Component: SidebarMinimal },
]

const PRESETS: Preset[] = RAW.map(({ meta, Component }) => ({
  ...meta,
  Component,
  installName: `${REGISTRY_NAMESPACE}/${meta.slug}`,
}))

export function getAllPresets(): Preset[] {
  return PRESETS
}

export function getPreset(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug)
}

export function getPresetSlugs(): string[] {
  return PRESETS.map((p) => p.slug)
}

/** Reads the literal preset.tsx source so the "Code" tab shows the shipped file. */
export async function getPresetSource(slug: string): Promise<string | null> {
  try {
    return await fs.readFile(join(PRESETS_DIR, slug, 'preset.tsx'), 'utf8')
  } catch {
    return null
  }
}
