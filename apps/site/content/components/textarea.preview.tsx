'use client'

import { Textarea } from '@devalok/shilp-sutra/ui/textarea'

export function TextareaHero() {
  return (
    <div className="w-full max-w-sm">
      <Textarea
        rows={4}
        defaultValue="shilp-sutra ships accessible, token-driven components with real motion. Tell us where it helped."
      />
    </div>
  )
}

export function TextareaVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="default & placeholder">
        <Textarea placeholder="Describe the issue…" rows={3} />
      </Block>

      <Block title="size">
        <Textarea size="xs" placeholder="Extra small" />
        <Textarea size="sm" placeholder="Small" />
        <Textarea size="md" placeholder="Medium" />
        <Textarea size="lg" placeholder="Large" />
      </Block>

      <Block title="state">
        <Textarea state="error" defaultValue="This field can't be empty." rows={2} />
        <Textarea state="warning" defaultValue="Getting a little long…" rows={2} />
        <Textarea state="success" defaultValue="Looks good." rows={2} />
      </Block>

      <Block title="disabled & read-only">
        <Textarea disabled placeholder="Disabled" rows={2} />
        <Textarea readOnly defaultValue="A previously submitted note." rows={2} />
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
