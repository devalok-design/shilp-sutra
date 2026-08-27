'use client'

import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@devalok/shilp-sutra/ui/tooltip'

export function TooltipHero() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Copies the install command to your clipboard</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TooltipVariants() {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-ds-06">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Block key={side} title={`side="${side}"`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft" size="icon" aria-label={`Info ${side}`}>
                  <IconInfoCircle />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={side}>Shows on the {side}</TooltipContent>
            </Tooltip>
          </Block>
        ))}
      </div>
    </TooltipProvider>
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
