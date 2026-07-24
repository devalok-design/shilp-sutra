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

import { AccordionHero, AccordionVariants } from '@/content/components/accordion.preview'
import { AlertHero, AlertVariants } from '@/content/components/alert.preview'
import { AvatarHero, AvatarVariants } from '@/content/components/avatar.preview'
import { BadgeHero, BadgeVariants } from '@/content/components/badge.preview'
import { BreadcrumbHero, BreadcrumbVariants } from '@/content/components/breadcrumb.preview'
import { ButtonHero, ButtonVariants } from '@/content/components/button.preview'
import { CardHero, CardVariants } from '@/content/components/card.preview'
import { CheckboxHero, CheckboxVariants } from '@/content/components/checkbox.preview'
import { ComboboxHero, ComboboxVariants } from '@/content/components/combobox.preview'
import { DotHero, DotVariants } from '@/content/components/dot.preview'
import { InputHero, InputVariants } from '@/content/components/input.preview'
import { LabelHero, LabelVariants } from '@/content/components/label.preview'
import { NumberInputHero, NumberInputVariants } from '@/content/components/number-input.preview'
import { PaginationHero, PaginationVariants } from '@/content/components/pagination.preview'
import { ProgressHero, ProgressVariants } from '@/content/components/progress.preview'
import { RadioHero, RadioVariants } from '@/content/components/radio.preview'
import { SearchInputHero, SearchInputVariants } from '@/content/components/search-input.preview'
import {
  SegmentedControlHero,
  SegmentedControlVariants,
} from '@/content/components/segmented-control.preview'
import { SelectHero, SelectVariants } from '@/content/components/select.preview'
import { SeparatorHero, SeparatorVariants } from '@/content/components/separator.preview'
import { SkeletonHero, SkeletonVariants } from '@/content/components/skeleton.preview'
import { SliderHero, SliderVariants } from '@/content/components/slider.preview'
import { SpinnerHero, SpinnerVariants } from '@/content/components/spinner.preview'
import { StatCardHero, StatCardVariants } from '@/content/components/stat-card.preview'
import { StepperHero, StepperVariants } from '@/content/components/stepper.preview'
import { SwitchHero, SwitchVariants } from '@/content/components/switch.preview'
import { TabsHero, TabsVariants } from '@/content/components/tabs.preview'
import { TextareaHero, TextareaVariants } from '@/content/components/textarea.preview'
import { ToggleHero, ToggleVariants } from '@/content/components/toggle.preview'
import { ToggleGroupHero, ToggleGroupVariants } from '@/content/components/toggle-group.preview'

export type ComponentPreview = {
  Hero: ComponentType
  Variants?: ComponentType
}

const PREVIEW_MAP: Record<string, ComponentPreview> = {
  // Buttons & actions
  button: { Hero: ButtonHero, Variants: ButtonVariants },
  toggle: { Hero: ToggleHero, Variants: ToggleVariants },
  'toggle-group': { Hero: ToggleGroupHero, Variants: ToggleGroupVariants },
  'segmented-control': { Hero: SegmentedControlHero, Variants: SegmentedControlVariants },
  // Forms & inputs
  input: { Hero: InputHero, Variants: InputVariants },
  textarea: { Hero: TextareaHero, Variants: TextareaVariants },
  checkbox: { Hero: CheckboxHero, Variants: CheckboxVariants },
  switch: { Hero: SwitchHero, Variants: SwitchVariants },
  radio: { Hero: RadioHero, Variants: RadioVariants },
  label: { Hero: LabelHero, Variants: LabelVariants },
  select: { Hero: SelectHero, Variants: SelectVariants },
  combobox: { Hero: ComboboxHero, Variants: ComboboxVariants },
  slider: { Hero: SliderHero, Variants: SliderVariants },
  'number-input': { Hero: NumberInputHero, Variants: NumberInputVariants },
  'search-input': { Hero: SearchInputHero, Variants: SearchInputVariants },
  // Data display
  card: { Hero: CardHero, Variants: CardVariants },
  badge: { Hero: BadgeHero, Variants: BadgeVariants },
  avatar: { Hero: AvatarHero, Variants: AvatarVariants },
  dot: { Hero: DotHero, Variants: DotVariants },
  'stat-card': { Hero: StatCardHero, Variants: StatCardVariants },
  skeleton: { Hero: SkeletonHero, Variants: SkeletonVariants },
  // Feedback
  alert: { Hero: AlertHero, Variants: AlertVariants },
  progress: { Hero: ProgressHero, Variants: ProgressVariants },
  spinner: { Hero: SpinnerHero, Variants: SpinnerVariants },
  // Navigation
  tabs: { Hero: TabsHero, Variants: TabsVariants },
  accordion: { Hero: AccordionHero, Variants: AccordionVariants },
  breadcrumb: { Hero: BreadcrumbHero, Variants: BreadcrumbVariants },
  pagination: { Hero: PaginationHero, Variants: PaginationVariants },
  stepper: { Hero: StepperHero, Variants: StepperVariants },
  separator: { Hero: SeparatorHero, Variants: SeparatorVariants },
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
