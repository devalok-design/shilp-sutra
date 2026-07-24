'use client'

import { Dot } from '@devalok/shilp-sutra/ui/dot'

export function DotHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-05">
      <Dot color="success" pulse label="Live" />
      <Dot color="warning" label="Degraded" />
      <Dot color="error" label="Down" />
      <Dot color="neutral" variant="off" label="Offline" />
    </div>
  )
}

export function DotVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="color">
        <Dot color="accent" />
        <Dot color="success" />
        <Dot color="warning" />
        <Dot color="error" />
        <Dot color="info" />
        <Dot color="neutral" />
      </Block>

      <Block title="variant">
        <Dot color="success" variant="filled" label="Filled" />
        <Dot color="success" variant="ring" label="Ring" />
        <Dot color="success" variant="off" label="Off" />
      </Block>

      <Block title="size">
        <Dot color="accent" size="xs" />
        <Dot color="accent" size="sm" />
        <Dot color="accent" size="md" />
        <Dot color="accent" size="lg" />
      </Block>

      <Block title="pulse">
        <Dot color="error" pulse pulseSpeed="fast" label="Recording" />
        <Dot color="success" pulse pulseSpeed="normal" label="Streaming" />
        <Dot color="info" pulse pulseSpeed="slow" label="Syncing" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-04">{children}</div>
    </div>
  )
}
