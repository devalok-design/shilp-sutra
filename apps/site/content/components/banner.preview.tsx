'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import { Banner } from '@devalok/shilp-sutra/ui/banner'

export function BannerHero() {
  return (
    <div className="w-full overflow-hidden rounded-control border border-surface-border-subtle">
      <Banner color="info" actions={<Button variant="ghost" size="sm">View</Button>}>
        New: assign tasks directly from the calendar view.
      </Banner>
    </div>
  )
}

export function BannerVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="color">
        <Banner color="info">Informational system announcement.</Banner>
        <Banner color="success">Your export is ready to download.</Banner>
        <Banner color="warning">Scheduled maintenance on Sunday 2am–4am UTC.</Banner>
        <Banner color="error">We could not process your last payment.</Banner>
        <Banner color="neutral">A neutral, low-emphasis notice.</Banner>
      </Block>

      <Block title="with actions">
        <Banner color="success" actions={<Button variant="ghost" size="sm">View report</Button>}>
          Your monthly report has been generated.
        </Banner>
      </Block>

      <Block title="dismissable (onDismiss)">
        <Banner color="info" onDismiss={() => {}}>
          Dismiss me — I animate away.
        </Banner>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-04 overflow-hidden rounded-control">{children}</div>
    </div>
  )
}
