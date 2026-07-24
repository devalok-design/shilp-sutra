'use client'

import * as React from 'react'
import { Separator } from '@devalok/shilp-sutra/ui/separator'

export function SeparatorHero() {
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-ds-02">
        <span className="text-body-md font-medium text-surface-fg">Devalok Studio</span>
        <span className="text-body-sm text-surface-fg-muted">Design & strategy</span>
      </div>
      <Separator className="my-ds-04" />
      <div className="flex h-6 items-center gap-ds-04 text-body-sm text-surface-fg-muted">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Guides</span>
        <Separator orientation="vertical" />
        <span>Support</span>
      </div>
    </div>
  )
}

export function SeparatorVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="horizontal">
        <span className="text-body-sm text-surface-fg-muted">Above</span>
        <Separator />
        <span className="text-body-sm text-surface-fg-muted">Below</span>
      </Block>

      <Block title="vertical">
        <div className="flex h-6 items-center gap-ds-04 text-body-sm text-surface-fg-muted">
          <span>One</span>
          <Separator orientation="vertical" />
          <span>Two</span>
          <Separator orientation="vertical" />
          <span>Three</span>
        </div>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-03">{children}</div>
    </div>
  )
}
