'use client'

import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { ButtonGroup } from '@devalok/shilp-sutra/ui/button-group'

export function ButtonGroupHero() {
  return (
    <ButtonGroup variant="outline">
      <Button>Day</Button>
      <Button>Week</Button>
      <Button>Month</Button>
    </ButtonGroup>
  )
}

export function ButtonGroupVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="attached (default)">
        <ButtonGroup variant="soft">
          <Button>Left</Button>
          <Button>Center</Button>
          <Button>Right</Button>
        </ButtonGroup>
      </Block>

      <Block title="attached={false}">
        <ButtonGroup variant="soft" attached={false}>
          <Button>Copy</Button>
          <Button>Paste</Button>
          <Button>Cut</Button>
        </ButtonGroup>
      </Block>

      <Block title="orientation=vertical">
        <ButtonGroup variant="outline" orientation="vertical">
          <Button startIcon={<IconBold />}>Bold</Button>
          <Button startIcon={<IconItalic />}>Italic</Button>
          <Button startIcon={<IconUnderline />}>Underline</Button>
        </ButtonGroup>
      </Block>

      <Block title="color=accent">
        <ButtonGroup variant="solid" color="accent">
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-start gap-ds-03">{children}</div>
    </div>
  )
}
