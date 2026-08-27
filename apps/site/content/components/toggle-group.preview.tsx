'use client'

import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-react'
import { ToggleGroup, ToggleGroupItem } from '@devalok/shilp-sutra/ui/toggle-group'

export function ToggleGroupHero() {
  return (
    <div className="flex flex-col gap-ds-04">
      <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter size={18} />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight size={18} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export function ToggleGroupVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="single select">
        <ToggleGroup type="single" defaultValue="center" aria-label="Alignment">
          <ToggleGroupItem value="left" aria-label="Left"><IconAlignLeft size={18} /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center"><IconAlignCenter size={18} /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right"><IconAlignRight size={18} /></ToggleGroupItem>
        </ToggleGroup>
      </Block>

      <Block title="multiple select">
        <ToggleGroup type="multiple" defaultValue={['bold', 'italic']} aria-label="Formatting">
          <ToggleGroupItem value="bold" aria-label="Bold"><IconBold size={18} /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><IconItalic size={18} /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><IconUnderline size={18} /></ToggleGroupItem>
        </ToggleGroup>
      </Block>

      <Block title="outline variant">
        <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Alignment">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </Block>

      <Block title="size">
        <ToggleGroup type="single" size="sm" defaultValue="a" aria-label="Sizes">
          <ToggleGroupItem value="a">Day</ToggleGroupItem>
          <ToggleGroupItem value="b">Week</ToggleGroupItem>
          <ToggleGroupItem value="c">Month</ToggleGroupItem>
        </ToggleGroup>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-04">{children}</div>
    </div>
  )
}
