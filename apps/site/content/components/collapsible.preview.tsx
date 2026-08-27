'use client'

import { IconChevronDown } from '@tabler/icons-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@devalok/shilp-sutra/ui/collapsible'

export function CollapsibleHero() {
  return (
    <div className="w-full max-w-md">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-control border border-surface-border-subtle bg-surface-panel px-ds-05 py-ds-03 text-body-md font-medium text-surface-fg">
          Show advanced settings
          <IconChevronDown size={16} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-ds-05 py-ds-03 text-body-sm text-surface-fg-subtle">
          These options are hidden by default to keep the form focused. Expand to
          fine-tune caching, retries, and timeouts.
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function CollapsibleVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="defaultOpen">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-control border border-surface-border-subtle bg-surface-panel px-ds-05 py-ds-03 text-body-md font-medium text-surface-fg">
            Open by default
            <IconChevronDown size={16} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-ds-05 py-ds-03 text-body-sm text-surface-fg-subtle">
            Content is visible on first render.
          </CollapsibleContent>
        </Collapsible>
      </Block>

      <Block title="closed initially">
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-control border border-surface-border-subtle bg-surface-panel px-ds-05 py-ds-03 text-body-md font-medium text-surface-fg">
            Click to expand
            <IconChevronDown size={16} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-ds-05 py-ds-03 text-body-sm text-surface-fg-subtle">
            Content revealed on interaction.
          </CollapsibleContent>
        </Collapsible>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
