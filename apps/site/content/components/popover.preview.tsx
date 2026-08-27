'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@devalok/shilp-sutra/ui/popover'

export function PopoverHero() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-ds-03">
          <div className="flex flex-col gap-ds-01">
            <span className="text-body-md font-semibold text-surface-fg">Dimensions</span>
            <span className="text-body-sm text-surface-fg-muted">Set the width and height for the layer.</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-ds-04 gap-y-ds-02 text-body-sm">
            <span className="text-surface-fg-muted">Width</span>
            <span className="text-surface-fg">100%</span>
            <span className="text-surface-fg-muted">Height</span>
            <span className="text-surface-fg">auto</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function PopoverVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-06">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Block key={align} title={`align="${align}"`}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="soft" size="sm">{align}</Button>
            </PopoverTrigger>
            <PopoverContent align={align} className="w-56">
              <span className="text-body-sm text-surface-fg-muted">
                Content aligned to the {align} of the trigger.
              </span>
            </PopoverContent>
          </Popover>
        </Block>
      ))}
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
