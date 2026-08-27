'use client'

import { ColorSwatch } from '@devalok/shilp-sutra/ui/color-swatch'

export function ColorSwatchHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-03">
      <ColorSwatch color="#c53637" size="lg" />
      <ColorSwatch color="#df911a" size="lg" />
      <ColorSwatch color="#308639" size="lg" />
      <ColorSwatch color="#1479b0" size="lg" />
      <ColorSwatch color="#7d5fad" size="lg" />
    </div>
  )
}

export function ColorSwatchVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <ColorSwatch color="#1479b0" size="sm" />
        <ColorSwatch color="#1479b0" size="md" />
        <ColorSwatch color="#1479b0" size="lg" />
      </Block>

      <Block title="shape">
        <ColorSwatch color="#308639" shape="circle" size="lg" />
        <ColorSwatch color="#308639" shape="rounded" size="lg" />
        <ColorSwatch color="#308639" shape="square" size="lg" />
      </Block>

      <Block title="ring (for light colors)">
        <ColorSwatch color="#ffffff" size="lg" ring />
        <ColorSwatch color="#f5f5f5" size="lg" ring />
      </Block>

      <Block title="checkerboard (transparency)">
        <ColorSwatch color="rgba(197,54,55,0.5)" size="lg" checkerboard />
        <ColorSwatch color="rgba(20,121,176,0.35)" size="lg" checkerboard />
      </Block>

      <Block title="copyable">
        <ColorSwatch color="#c53637" size="lg" copyable />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-03">{children}</div>
    </div>
  )
}
