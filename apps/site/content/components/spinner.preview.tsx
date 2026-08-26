'use client'

import * as React from 'react'
import { Spinner } from '@devalok/shilp-sutra/ui/spinner'

export function SpinnerHero() {
  return (
    <div className="flex items-center gap-ds-04 text-surface-fg-muted">
      <Spinner />
      <span className="text-body-md">Loading projects…</span>
    </div>
  )
}

export function SpinnerVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Block>

      <Block title="state">
        <Spinner state="spinning" />
        <Spinner state="success" />
        <Spinner state="error" />
      </Block>

      <Block title="variant: filled">
        <Spinner state="success" variant="filled" />
        <Spinner state="error" variant="filled" />
      </Block>

      <Block title="variant: bare (currentColor)">
        <span className="text-success-11 inline-flex">
          <Spinner state="success" variant="bare" />
        </span>
        <span className="text-error-11 inline-flex">
          <Spinner state="error" variant="bare" />
        </span>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-05">{children}</div>
    </div>
  )
}
