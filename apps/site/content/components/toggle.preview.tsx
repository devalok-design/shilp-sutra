'use client'

import { IconBold, IconItalic, IconStar, IconUnderline } from '@tabler/icons-react'
import { Toggle } from '@devalok/shilp-sutra/ui/toggle'

export function ToggleHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-02">
      <Toggle defaultPressed aria-label="Bold">
        <IconBold size={18} />
      </Toggle>
      <Toggle aria-label="Italic">
        <IconItalic size={18} />
      </Toggle>
      <Toggle aria-label="Underline">
        <IconUnderline size={18} />
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        <IconStar size={18} />
        Favorite
      </Toggle>
    </div>
  )
}

export function ToggleVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <Toggle defaultPressed>Default</Toggle>
        <Toggle variant="outline" defaultPressed>Outline</Toggle>
      </Block>

      <Block title="color (pressed)">
        <Toggle color="accent" defaultPressed>Accent</Toggle>
        <Toggle color="success" defaultPressed>Success</Toggle>
        <Toggle color="error" defaultPressed>Error</Toggle>
        <Toggle color="neutral" defaultPressed>Neutral</Toggle>
      </Block>

      <Block title="size">
        <Toggle size="sm" defaultPressed>SM</Toggle>
        <Toggle size="md" defaultPressed>MD</Toggle>
        <Toggle size="lg" defaultPressed>LG</Toggle>
      </Block>

      <Block title="state">
        <Toggle>Off</Toggle>
        <Toggle defaultPressed>On</Toggle>
        <Toggle disabled>Disabled</Toggle>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
