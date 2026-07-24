'use client'

import { IconActivity, IconChartBar, IconFolder, IconUsers } from '@tabler/icons-react'
import { StatFlash } from '@devalok/shilp-sutra'

export function StatFlashHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-05">
      <StatFlash icon={<IconFolder />} flash="up" />
      <StatFlash icon={<IconUsers />} flash="record" />
      <StatFlash icon={<IconChartBar />} flash="down" />
    </div>
  )
}

export function StatFlashVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="preset flash">
        <StatFlash icon={<IconFolder />} flash="up" />
        <StatFlash icon={<IconFolder />} flash="down" />
        <StatFlash icon={<IconFolder />} flash="goal" />
        <StatFlash icon={<IconFolder />} flash="record" />
        <StatFlash icon={<IconFolder />} flash="alert" />
        <StatFlash icon={<IconFolder />} flash="live" />
      </Block>

      <Block title="fill=solid">
        <StatFlash icon={<IconActivity />} flash="up" fill="solid" />
        <StatFlash icon={<IconActivity />} flash="live" fill="solid" />
      </Block>

      <Block title="explicit { tone, icon }">
        <StatFlash icon={<IconActivity />} flash={{ tone: 'info', icon: <IconChartBar /> }} />
      </Block>

      <Block title="speed">
        <StatFlash icon={<IconFolder />} flash="up" speed="fast" />
        <StatFlash icon={<IconFolder />} flash="up" speed="slow" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-05">{children}</div>
    </div>
  )
}
