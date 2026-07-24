/**
 * Blocks registry — slug -> metadata and source loader.
 *
 * Each block lives at apps/site/content/blocks/<slug>/ with:
 *   - block.tsx  → the actual rendered React composition
 *   - meta.ts    → title, description, tags
 *
 * The source string for the "Code" tab is read from block.tsx at build time
 * via fs so the displayed code is the literal source the consumer would copy.
 */
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import type { ComponentType } from 'react'

import { DashboardBlock, dashboardMeta } from '@/content/blocks/dashboard/index'
import { PricingBlock, pricingMeta } from '@/content/blocks/pricing/index'
import { SignupBlock, signupMeta } from '@/content/blocks/signup/index'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const BLOCKS_DIR = join(REPO_ROOT, 'apps', 'site', 'content', 'blocks')

export type BlockMeta = {
  slug: string
  title: string
  description: string
  tags: string[]
  /** Components from shilp-sutra used. Surfaces below the preview. */
  uses: string[]
}

export type Block = BlockMeta & {
  Component: ComponentType
}

const BLOCKS: Block[] = [
  { ...dashboardMeta, Component: DashboardBlock },
  { ...signupMeta, Component: SignupBlock },
  { ...pricingMeta, Component: PricingBlock },
]

export function getAllBlocks(): Block[] {
  return BLOCKS
}

export function getBlock(slug: string): Block | undefined {
  return BLOCKS.find((b) => b.slug === slug)
}

export function getBlockSlugs(): string[] {
  return BLOCKS.map((b) => b.slug)
}

/**
 * Reads the literal source of <slug>/block.tsx so the "Code" tab shows the
 * exact file a consumer would copy.
 */
export async function getBlockSource(slug: string): Promise<string | null> {
  try {
    return await fs.readFile(join(BLOCKS_DIR, slug, 'block.tsx'), 'utf8')
  } catch {
    return null
  }
}
