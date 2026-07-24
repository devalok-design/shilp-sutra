'use client'

import { MultiProgressRing, ProgressRing } from '@devalok/shilp-sutra/ui/progress-ring'

export function ProgressRingHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-06">
      <ProgressRing value={72} size="lg" showValue />
      <ProgressRing value={40} size="lg" color="warning" showValue />
      <MultiProgressRing
        size="lg"
        rings={[
          { value: 80, color: 'error', label: 'Move' },
          { value: 55, color: 'success', label: 'Exercise' },
          { value: 30, color: 'info', label: 'Stand' },
        ]}
      />
    </div>
  )
}

export function ProgressRingVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <ProgressRing value={60} size="sm" showValue />
        <ProgressRing value={60} size="md" showValue />
        <ProgressRing value={60} size="lg" showValue />
      </Block>

      <Block title="color">
        <ProgressRing value={65} color="default" showValue />
        <ProgressRing value={65} color="success" showValue />
        <ProgressRing value={65} color="warning" showValue />
        <ProgressRing value={65} color="error" showValue />
      </Block>

      <Block title="custom max">
        <ProgressRing value={3} max={12} size="lg" color="info" showValue />
      </Block>

      <Block title="MultiProgressRing">
        <MultiProgressRing
          size="lg"
          rings={[
            { value: 90, color: 'error' },
            { value: 50, color: 'success' },
          ]}
        />
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
