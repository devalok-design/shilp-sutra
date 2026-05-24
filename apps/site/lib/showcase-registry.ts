/**
 * Showcase registry — one industry example per shipped brand preset.
 *
 * Each example is a full UI composition that demonstrates how shilp-sutra
 * fits a particular industry's use case. The page wraps each example in a
 * CSS-var override that applies that brand's accent ramp, so the same
 * library reads completely differently across surfaces.
 */
import type { ComponentType } from 'react'

import { AtlasShowcase } from '@/content/showcase/atlas'
import { DevalokShowcase } from '@/content/showcase/devalok'
import { LendisShowcase } from '@/content/showcase/lendis'
import { MiraShowcase } from '@/content/showcase/mira'
import { PatrikaShowcase } from '@/content/showcase/patrika'
import { VaidyaShowcase } from '@/content/showcase/vaidya'

export type ShowcaseEntry = {
  slug: string
  product: string
  industry: string
  tagline: string
  hue: number
  chroma: number
  /** Short paragraph above the example — what use-case this proves */
  premise: string
  /** Composed components surfaced on this example, for the audit chip row */
  uses: string[]
  Component: ComponentType
}

const ENTRIES: ShowcaseEntry[] = [
  {
    slug: 'atlas',
    product: 'Atlas',
    industry: 'SaaS · B2B',
    tagline: 'Project workspaces for distributed teams.',
    hue: 245,
    chroma: 0.19,
    premise:
      'A workspace dashboard. The hardest screen in any B2B product: it has to greet the user, surface what changed, and stay out of the way. Card composition + Avatar groups + Badges + Buttons in concert.',
    uses: ['Card composition', 'Avatar stacks', 'Stat tiles', 'Activity lists', 'Sidebar layout'],
    Component: AtlasShowcase,
  },
  {
    slug: 'lendis',
    product: 'Lendis',
    industry: 'Fintech',
    tagline: 'KYC + lending, end to end.',
    hue: 145,
    chroma: 0.16,
    premise:
      'A financial dashboard. Big numbers, dense transaction lists, careful colour use for credits vs debits, KYC trust signal, and a beneficiary form that has to feel safe to touch.',
    uses: ['Balance card', 'Transaction list', 'KYC card', 'Form composition', 'Status badges'],
    Component: LendisShowcase,
  },
  {
    slug: 'mira',
    product: 'Mira',
    industry: 'Consumer · D2C',
    tagline: 'Slow-made textiles, shipped global.',
    hue: 55,
    chroma: 0.18,
    premise:
      'A product page. Colour swatches that change a gradient hero in real time, size pickers, two CTAs, a favourite toggle, and related products. Every interaction is interactive.',
    uses: ['Product hero', 'Variant picker', 'Size grid', 'CTA pair', 'Related grid'],
    Component: MiraShowcase,
  },
  {
    slug: 'vaidya',
    product: 'Vaidya',
    industry: 'Healthcare',
    tagline: 'A clinic, in your pocket.',
    hue: 200,
    chroma: 0.15,
    premise:
      'A patient summary. Identity card, three vital tiles, history list, and an appointment booker with disabled slots. The use case where contrast and density have to be exactly right.',
    uses: ['Patient card', 'Vital tiles', 'History timeline', 'Slot picker', 'Care team list'],
    Component: VaidyaShowcase,
  },
  {
    slug: 'patrika',
    product: 'Patrika',
    industry: 'Editorial',
    tagline: 'Long-form journalism, weekly.',
    hue: 15,
    chroma: 0.2,
    premise:
      'A long-read article. Generous typography, an author byline, a pull-quote, related issues, and a subscribe card. Editorial design where typography does the heavy lifting.',
    uses: ['Article header', 'Author byline', 'Pull-quote', 'Related reading', 'Subscribe card'],
    Component: PatrikaShowcase,
  },
  {
    slug: 'devalok',
    product: 'Devalok',
    industry: 'Studio · House brand',
    tagline: 'The studio that builds shilp-sutra.',
    hue: 360,
    chroma: 0.19,
    premise:
      'The studio itself. Sanskrit verse, principles, practices, surfaces — composed in the same library so the medium and the message match.',
    uses: ['Verse heading', 'Principles grid', 'Services list', 'Built-with card', 'CTA banner'],
    Component: DevalokShowcase,
  },
]

export function getAllShowcases(): ShowcaseEntry[] {
  return ENTRIES
}

export function getShowcase(slug: string): ShowcaseEntry | undefined {
  return ENTRIES.find((e) => e.slug === slug)
}

export function getShowcaseSlugs(): string[] {
  return ENTRIES.map((e) => e.slug)
}
