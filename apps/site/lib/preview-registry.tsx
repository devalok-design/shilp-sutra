/**
 * Live-preview registry — maps a component slug to its hand-curated preview.
 *
 * Static imports. Each preview file starts with `"use client"` so the React
 * components stay client-side, but the registry itself is plain server-safe
 * data (a slug → component map). Server components import this directly
 * and render the matching preview into the detail page.
 *
 * Adding a preview:
 *   1. Create apps/site/content/components/<slug>.preview.tsx (use client)
 *   2. Export named hero + variants components
 *   3. Add the slug to PREVIEW_MAP below
 */
import type { ComponentType } from 'react'

import { AlertHero, AlertVariants } from '@/content/components/alert.preview'
import { AvatarHero, AvatarVariants } from '@/content/components/avatar.preview'
import { BadgeHero, BadgeVariants } from '@/content/components/badge.preview'
import { ButtonHero, ButtonVariants } from '@/content/components/button.preview'
import { CardHero, CardVariants } from '@/content/components/card.preview'
import { TabsHero, TabsVariants } from '@/content/components/tabs.preview'

export type ComponentPreview = {
  Hero: ComponentType
  Variants?: ComponentType
}

const PREVIEW_MAP: Record<string, ComponentPreview> = {
  button: { Hero: ButtonHero, Variants: ButtonVariants },
  card: { Hero: CardHero, Variants: CardVariants },
  badge: { Hero: BadgeHero, Variants: BadgeVariants },
  alert: { Hero: AlertHero, Variants: AlertVariants },
  avatar: { Hero: AvatarHero, Variants: AvatarVariants },
  tabs: { Hero: TabsHero, Variants: TabsVariants },
}

export function hasPreview(slug: string): boolean {
  return slug in PREVIEW_MAP
}

export function getPreviewSlugs(): string[] {
  return Object.keys(PREVIEW_MAP)
}

export function getPreview(slug: string): ComponentPreview | null {
  return PREVIEW_MAP[slug] ?? null
}
