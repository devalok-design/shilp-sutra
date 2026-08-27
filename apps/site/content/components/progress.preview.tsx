'use client'

import * as React from 'react'
import { Progress } from '@devalok/shilp-sutra/ui/progress'

export function ProgressHero() {
  return (
    <div className="w-full max-w-sm">
      <Progress value={72} label="Uploading" showValue />
    </div>
  )
}

export function ProgressVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="color">
        <Progress value={45} color="accent" />
        <Progress value={45} color="success" />
        <Progress value={45} color="warning" />
        <Progress value={45} color="error" />
      </Block>

      <Block title="size">
        <Progress value={60} size="sm" />
        <Progress value={60} size="md" />
        <Progress value={60} size="lg" />
      </Block>

      <Block title="autoColor by value">
        <Progress value={40} autoColor showValue />
        <Progress value={72} autoColor showValue />
        <Progress value={95} autoColor showValue />
      </Block>

      <Block title="indeterminate">
        <Progress value={null} label="Syncing" />
      </Block>

      <Block title="segments">
        <Progress
          segments={[
            { value: 40, color: 'success' },
            { value: 25, color: 'warning' },
            { value: 15, color: 'error' },
          ]}
        />
      </Block>

      <Block title="compound (Root / Track / Indicator)">
        <Progress.Root value={68} size="md">
          <Progress.Label>Storage</Progress.Label>
          <Progress.Track>
            <Progress.Indicator color="accent" />
          </Progress.Track>
          <Progress.Value />
        </Progress.Root>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-04 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-04">{children}</div>
    </div>
  )
}
