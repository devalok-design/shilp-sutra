'use client'

import { Link } from '@devalok/shilp-sutra/ui/link'

export function LinkHero() {
  return (
    <p className="text-body-md text-surface-fg">
      Read the <Link href="#">getting started guide</Link> to set up your first project.
    </p>
  )
}

export function LinkVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="inline (default)">
        <p className="text-body-md text-surface-fg">
          This paragraph has an <Link href="#">inline link</Link> that flows with the text.
        </p>
      </Block>

      <Block title="inline={false} (block)">
        <Link href="#" inline={false}>Standalone block link</Link>
        <Link href="#" inline={false}>Another block link</Link>
      </Block>

      <Block title="external">
        <Link href="https://devalok.in" target="_blank" rel="noreferrer">
          Visit devalok.in
        </Link>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
