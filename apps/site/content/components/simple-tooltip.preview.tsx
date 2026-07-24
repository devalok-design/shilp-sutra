'use client'

import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SimpleTooltip } from '@devalok/shilp-sutra/composed/simple-tooltip'

export function SimpleTooltipHero() {
  return (
    <SimpleTooltip content="Copy the install command to your clipboard">
      <Button variant="outline">Hover me</Button>
    </SimpleTooltip>
  )
}

export function SimpleTooltipVariants() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-ds-06">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Block key={side} title={`side="${side}"`}>
          <SimpleTooltip content={`Shows on the ${side}`} side={side}>
            <Button variant="soft" size="icon" aria-label={`Info ${side}`}>
              <IconInfoCircle />
            </Button>
          </SimpleTooltip>
        </Block>
      ))}
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
